import json, asyncio, numpy as np
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from .gameChannel import GameChannel, gameManager
from .tournamentChannel import TournamentChannel, TournamentManager
from .playLog import new_game
from django.utils import timezone
from django.core.cache import cache

#LERA use online
def isUserOnline(user_id):
	active_users = cache.get('active_users')
	if active_users == None or user_id not in active_users:
		return False
	return True

class MainConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		print("websocket connected!")
		self.user_id = self.scope['url_route']['kwargs']['user_id']
		await self.accept()
		self.gameChannel = GameChannel()
		if not gameManager.running_tasks:
			gameManager.running_tasks.add(asyncio.create_task(gameManager.broadcast_game_state()))
		active_users = cache.get('active_users')
		if active_users == None:
			active_users = []
		active_users.append(self.user_id)
		active_users = list(set(active_users))
		cache.set('active_users', active_users)
		await self.send_active_users()
		# await self.send_channel("all", {
		# 	"type": "consumer.updates",
		# 	"active_users": active_users
		# })
		#TODO cehck if self consumer was here before....
		self.user_data = cache.get(f"consumer_{self.user_id}")
		if self.user_data :
			self.tournament = TournamentManager().get_tournament(self.user_data.tournament)
			for room in self.user_data.rooms:
				await self.join_channel(room, False)
		else :
			self.tournament = None
			self.user_data = {"rooms":[], "tournament":None}
			await self.join_channel("all")
			await self.join_channel(f"{self.user_id}")
			await self.update_tournament_display()
			cache.set(f"consumer_{self.user_id}", self.user_data)
		await self.send_active_users()


	async def disconnect(self, code=None):
		global active_users
		if self.gameChannel and self.gameChannel.status == "on":
			await self.gameChannel.finish()
		if self.tournament and self.tournament.status == "active":
			await self.tournament.disconnect(self)
		await self.remove_channel("all")
		active_users = None
		active_users = cache.get('active_users')
		if active_users == None:
			active_users = []
		active_users.remove(self.user_id)
		cache.set('active_users', active_users)
		#broadcast new users
		await self.send_active_users()
		# await self.send_channel("all", {
		# 	"type": "consumer.updates",
		# 	"active_users": active_users
		# })
		print("WEBOSCKET DISCONNECTED!!!!!")

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data["channel"] == "log":
			await new_game(data)
	
		if data["channel"] == "game":
			await self.gameChannel.receive(self, data)

		elif data["channel"] == "tournament":
			pending_tournament = TournamentManager().get_tournament(cache.get("pending_tournament"))
			if data["action"] == "exit live":
				if self.gameChannel and self.gameChannel.status == "on":
					await self.gameChannel.finish()
				if self.tournament and self.tournament.status == "active":
					await self.tournament.disconnect(self)
			elif data["action"] == "create":
				if pending_tournament == None:
					newTour = TournamentChannel(self)
					await self.send_channel("all", {
								"type" : "tour.updates",
								"update_tour_registration" : "join",
								"button" : "join",
								"prize_pool" : newTour.prize_pool,
								"now" : timezone.now().isoformat(),
								"start" : newTour.start_time.isoformat()
							})
					asyncio.create_task(newTour.notify_start())
					asyncio.create_task(newTour.start())
				else : 
					await self.send_self({
								"type" : "tour.updates",
								"update_tour_registration" : "join",
								"button" : "join",
								"prize_pool" : pending_tournament.prize_pool,
								"now" : timezone.now().isoformat(),
								"start" : newTour.start_time.isoformat(),
							})

			elif data["action"] == "join" and pending_tournament != None:
					await pending_tournament.join(self)
			elif data["action"] == "succesfull payment" and pending_tournament != None and data["tour_id"] == pending_tournament.tour_id:
					await pending_tournament.confirm_payment(self)
			elif data["action"] == "finish" and self.tournament != None:
				await self.tournament.disconnect(self)
				await self.gameChannel.finish()

 
	#Lera stuff list of the users
	async def send_active_users(self):
		active_users = cache.get('active_users') or []
  		# await get_channel_layer()({

		await get_channel_layer().group_send("all", {
			"type": "consumer.updates",
			"active_users": active_users
		})
  
	async def update_tournament_display(self):
		pending_tournament = TournamentManager().get_tournament(cache.get("pending_tournament"))
		if pending_tournament == None:
			await self.send_self({
				"type" : "tour.updates",
				"update_tour_registration" : "create",
				"button" : "create",
			})
		#paying
		elif self.user_id in pending_tournament.registered:
			await self.send_self({
				"type" : "tour.updates",
				"update_tour_registration" : "join",
				"button" : "subscribed",
				"prize_pool" : pending_tournament.prize_pool,
				"now" : timezone.now().isoformat(),
				"start" : pending_tournament.start_time.isoformat()
			})
		elif pending_tournament.status == "locked":
			await self.send_self({
				"type" : "tour.updates",
				"update_tour_registration" : "join",
				"button" : "locked",
				"prize_pool" : pending_tournament.prize_pool,
				"now" : timezone.now().isoformat(),
				"start" : pending_tournament.start_time.isoformat()
			})
		else:
			await self.send_self({
				"type" : "tour.updates",
				"update_tour_registration" : "join",
				"button" : "join",
				"prize_pool" : pending_tournament.prize_pool,
				"now" : timezone.now().isoformat(),
				"start" : pending_tournament.start_time.isoformat()
			})

	def update_self_tournament(self, value):
		if value == None:
			self.update_user_data({"action":"set", "tournament": None})
			self.tournament = None
		else:
			self.update_user_data({"action":"set", "tournament":value})
			self.tournament = TournamentManager().get_tournament(value)

	def update_user_data(self, data):
		user_data = cache.get(f"consumer_{self.user_id}")
		for key, command in data.items():
			if not isinstance(command, dict) or "action" not in command:
				continue  # Skip invalid entries
			action = command["action"]
			value = command.get("value")
			if action == "set":
				user_data[key] = value
			elif action == "append":
				if key not in user_data:
					user_data[key] = []
				if isinstance(user_data[key], list):
					user_data[key].append(value)
			elif action == "remove":
				if isinstance(user_data.get(key), list):
					try:
						user_data[key].remove(value)
					except ValueError:
						pass  # Item not in list, ignore

		cache.set(f"consumer_{self.user_id}", user_data)


	async def join_channel(self, room, update = True):
		await self.channel_layer.group_add(room, self.channel_name)
		if update:
			self.update_user_data({"action":"append", "value": room})

	async def remove_channel(self, room):
		await self.channel_layer.group_discard(room, self.channel_name)
		self.update_user_data({"action":"remove", "value": room})

	async def send_channel(self, room, message):
		await self.channel_layer.group_send(room, message)

	async def send_self(self, message):
		await self.send(text_data=json.dumps(message))
	
	async def game_updates(self, event):
		if ("update_display") in event:
			await self.send(text_data=json.dumps(event))
		else :
			await self.gameChannel.game_updates(event)

	async def tour_updates(self, event):
		await self.send(text_data=json.dumps(event))
  
	async def consumer_updates(self, event):
		await self.send(text_data=json.dumps(event))


			


