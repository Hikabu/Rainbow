import json, asyncio, numpy as np
from channels.generic.websocket import AsyncWebsocketConsumer
from .gameChannel import join_game_channel, GameManager
from channels.db import database_sync_to_async # expect function not result
from .tournamentChannel import TournamentChannel, TournamentManager
from .registration import new_game, can_user_log_game
from django.utils import timezone
from django.core.cache import cache
# import logging

# logging.basicConfig(
#     level=logging.INFO,
#     format="%(asctime)s [%(levelname)s] %(message)s",
#     handlers=[logging.StreamHandler()]
# )

# logger = logging.getLogger(__name__)
#LERA use online
def isUserOnline(user_id):
	active_users = cache.get('active_users')
	if active_users == None or user_id not in active_users:
		return False
	return True
#user bla connects-axios bla's friends-for every frined-send live update that bla is onlien

#static global
max_reconnection_time = 10
all_consumers = {}
#async def friends_status(self, event):
 #   await self.send(text_data=json.dumps({
#		"type": "friend_status",
#		"friend_id": event["friend_id"],
#		"is_online": event["is_online"],
#	}))
#async def notify_friends(self, is_online):
#	try:
#		#take user with orm from db but on async so the loop will loop
#		#send to separate thread so it will not block the websocket perfomance
#		user = await database_sync_to_async(User.objects.get)(id=self.user_id)
#		#lambda to call the fuction not the result so when its safe to call the labbda will be executed
#		friends = await database_sync_to_async(lambda: list(user.friends.all().values_list('id', flat=True))) # only friends id[2,5,6]
#
#		for friend_id in friends:
#			await self.channel_layer.group_send(
#				str(friend_id),
#				{
#					"type": "friend_status",
#					"frined_id": self.user_id,
#					"is_online": is_online,
#				}
#			)
#     
#    
	#except Exception as e:
#	    print(f"Error with friend connection: {e} ")
#    
#			

class MainConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.user_id = self.scope['url_route']['kwargs']['user_id']
		await self.accept()
		active_users = cache.get('active_users')
		if active_users == None:
			active_users = []
		active_users.append(self.user_id)
		active_users = list(set(active_users))
		cache.set('active_users', active_users)
		#await self.send_active_users() #Lera staff
		# await self.send_channel("all", {
		# 	"type": "consumer.updates",
		# 	"active_users": active_users
		# })
		#TODO cehck if self consumer was here before....
		self.user_data = cache.get(f"consumer_{self.user_id}")
		await self.notify_friends(is_online=True)
		if self.user_data :
			print("retrieving consumer", self.user_data)
			self.tournament = TournamentManager().get_tournament(self.user_data.get("tournament"))
			self.dimensions = self.user_data.get("dimensions")
			self.game = GameManager().get_game(self.user_data.get("game"))
			for room in self.user_data.get("rooms"):
				print("adding room: ", room)
				await self.join_channel(room, False)	
		else :
			self.game = None
			self.tournament = None
			self.dimensions = None
			self.tournament = None
			self.user_data = {"rooms":[], "tournament":None, "game": None, "dimensions" : None}
			cache.set(f"consumer_{self.user_id}", self.user_data)
			await self.join_channel(f"{self.user_id}")
		await self.join_channel("all")
		prev_consumer = None
		await self.enter_scene()

	async def should_exit_live(self):
		global max_reconnection_time

		print("crate task...")
		await asyncio.sleep(max_reconnection_time)
		print("exiting live?")
		active_users = None
		active_users = cache.get('active_users')
		if active_users != None and self.user_id in active_users:
			print("back online...")
			return	
		await self.exit_live()
	
	async def exit_live(self):
		print("yes, exiting live")
		if self.game and self.game.status != "finished":
			print("end game")
			await self.game.disconnect(self)
		if self.tournament :
			print("end tournament")
			await self.tournament.remove_player(self.user_id)
		if self.user_id in all_consumers and all_consumers[self.user_id] == self:
			del all_consumers[self.user_id]

	async def disconnect(self, code=None):
		
		asyncio.create_task(self.should_exit_live())
		await self.remove_channel("all")
		active_users = None
		active_users = cache.get('active_users')
		if active_users == None:
			active_users = []
		if self.user_id in active_users:
			active_users.remove(self.user_id)
			cache.set('active_users', active_users)
		print("WEBOSCKET DISCONNECTED!!!!!")

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data["channel"] == "log":
			if "action" in data:
				if data["action"] == "can_user_log_game":
					await can_user_log_game(self, data)
				if data["action"] == "new_game":
					await new_game(data)
		if data["channel"] == "game":
			if "boundaries" in data:
				self.dimensions = data["boundaries"]
				self.update_user_data({"action":"set", "key":"dimensions", "value":self.dimensions})
			if "request" in data and data["request"] == "start game":
				self.game = await join_game_channel(self, data["game_id"])
			elif self.game and "request" in data and data["request"] == "update paddles":
				self.game.logic.update_paddles(data)
			elif self.game and "request" in data and data["request"] == "game end":
				await self.game.disconnect(self)

		elif data["channel"] == "tournament":
			pending_tournament = TournamentManager().get_tournament(cache.get("pending_tournament"))
			if data["action"] == "exit live":
				await self.should_exit_live()

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
					asyncio.create_task(newTour.fade_out_notification())
					asyncio.create_task(newTour.start())

				else : 
					await self.send_self({
								"type" : "tour.updates",
								"update_tour_registration" : "join",
								"button" : "join",
								"prize_pool" : pending_tournament.prize_pool,
								"now" : timezone.now().isoformat(),
								"start" : pending_tournament.start_time.isoformat(),
							})

			elif data["action"] == "join" and pending_tournament != None:
					await pending_tournament.join(self)
			elif data["action"] == "succesfull payment" and pending_tournament != None and data["tour_id"] == pending_tournament.tour_id:
					await pending_tournament.confirm_payment(self, data["alias"])

	async def enter_scene(self):
		state = None
		substate = None
		if self.tournament is not None:
			if self.user_id in self.tournament.now_waiting:
				state = 3
				substate = 10
			elif self.user_id in self.tournament.now_playing:
				state = 3
				substate = 11
		if self.game is not None:
			await self.send_self({"type": "game.updates", 
			"state" : "player names", 
			"name1" : self.game.names[0], 
			"name2" : self.game.names[1],
			})
			if self.game.logic.paddles[1].owner == "local":
				state = 1
				substate = 3
			elif self.game.logic.paddles[1].owner == "AI":
				state = 2
				substate = 3
		msg = { "type": "ready" }
		if state is not None and substate is not None:
			msg["state"] = state
			msg["substate"] = substate

		await self.send_self(msg)
		await self.update_tournament_display()

	async def update_tournament_display(self):
		pending_tournament = TournamentManager().get_tournament(cache.get("pending_tournament"))
		if self.tournament:
			if pending_tournament == None or self.tournament.tour_id == pending_tournament.tour_id:
				if self.tournament.status == "open" or self.tournament.status == "locked":
					await self.send_self({
						"type" : "tour.updates",
						"update_tour_registration" : "join",
						"button" : "subscribed",
						"prize_pool" : pending_tournament.prize_pool,
						"now" : timezone.now().isoformat(),
						"start" : pending_tournament.start_time.isoformat()
					})
					if self.tournament.status == "locked" and self.tournament.fadeout == False:
						await self.send_self({"type" : "tour.updates",
						"notification" : "start"})
		if pending_tournament == None:
			await self.send_self({
				"type" : "tour.updates",
				"update_tour_registration" : "create",
				"button" : "create",
			})
		#paying
		elif pending_tournament.status == "locked" and self.tournament == None:
			await self.send_self({
				"type" : "tour.updates",
				"update_tour_registration" : "join",
				"button" : "locked",
				"prize_pool" : pending_tournament.prize_pool,
				"now" : timezone.now().isoformat(),
				"start" : pending_tournament.start_time.isoformat()
			})
		elif self.tournament == None:
			await self.send_self({
				"type" : "tour.updates",
				"update_tour_registration" : "join",
				"button" : "join",
				"prize_pool" : pending_tournament.prize_pool,
				"now" : timezone.now().isoformat(),
				"start" : pending_tournament.start_time.isoformat()
			})

	def update_user_data(self, data):
		user_data = cache.get(f"consumer_{self.user_id}")
		if user_data == None:
			user_data = {"tournament":None, "game":None, "rooms":[], "dimensions":None}
		if data.get("action") == "set":
			user_data[ data.get("key")] = data.get("value")

		elif data.get("action") == "append":
			if data.get("key") not in user_data:
				user_data[data.get("key")] = []
			user_data[data.get("key")].append(data.get("value"))

		elif data.get("action") == "remove":
			if data.get("key") in user_data and data.get("value") in user_data[data.get("key")]:
				user_data[data.get("key")].remove(data.get("value"))

		cache.set(f"consumer_{self.user_id}", user_data)


	async def join_channel(self, room, update = True):
		await self.channel_layer.group_add(room, self.channel_name)
		if update:
			self.update_user_data({"action":"append", "key":"rooms", "value":room})
	
	async def remove_channel(self, room):
		await self.channel_layer.group_discard(room, self.channel_name)
		self.update_user_data({"action":"remove", "key":"rooms", "value": room})

	async def send_channel(self, room, message):
		await self.channel_layer.group_send(room, message)

	async def send_self(self, message):
		await self.send(text_data=json.dumps(message))

	async def tour_updates(self, event):
		await self.send(text_data=json.dumps(event))
  
	async def consumer_updates(self, event):
		await self.send(text_data=json.dumps(event))

	async def game_updates(self, event):
		if "action" in event and event["action"] == "delete game" and self.game:
			await self.remove_channel(self.game.room)
			self.game = None
			self.update_user_data({"action":"set", "key":"game", "value": None})
		elif nested_value_in(event, ["updates", "state"], "playing"):
			updates = {}
			x = nested_value_in(event, ["updates", "x", 0])
			y = nested_value_in(event, ["updates", "y", 0])
			if x is not None and y is not None:
				updates["ball"] = {
					"x": x * self.dimensions["x"],
					"y": y * self.dimensions["y"]
				}
			paddle_left = nested_value_in(event, ["updates", "y", 1])
			if paddle_left is not None:
				updates["paddle_left"] = paddle_left * self.dimensions["y"]
			paddle_right = nested_value_in(event, ["updates", "y", 2])
			if paddle_right is not None:
				updates["paddle_right"] = paddle_right * self.dimensions["y"]
			for key in ["score1", "score2", "state"]:
				value = nested_value_in(event, ["updates", key])
				if value is not None:
					updates[key] = value
			await self.send(text_data=json.dumps({"type": "game.updates", "updates":updates}))
		else :
			await self.send(text_data=json.dumps(event))
	
def nested_value_in(data, keys, value=None):
	current = data
	for key in keys:
		if isinstance(current, dict):
			if key not in current:
				return False
			current = current[key]
		elif isinstance(current, list):
			if not isinstance(key, int) or key >= len(current):
				return False
			current = current[key]
		else:
			return False
	if value is not None:
		return current == value
	return current



