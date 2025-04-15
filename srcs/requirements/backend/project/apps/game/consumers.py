import json
from channels.generic.websocket import AsyncWebsocketConsumer
# from .game import Game
import asyncio
# import time
# from channels.layers import get_channel_layer
# from .playLog import get_max_players
# from .playLog import get_player_alias
# from .playLog import store_game_results
from .gameChannel import GameChannel, gameManager
from .tournamentChannel import TournamentChannel, ongoing_tournaments, pending_tournament
from django.utils import timezone

# from .tournamentChannel import TournamentChannel
import numpy as np

active_users = []

class MainConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		global gameManager, active_users
		print("websocket connected!")
		self.user_id = self.scope['url_route']['kwargs']['user_id']
		await self.accept()
		self.gameChannel = GameChannel()
		if not gameManager.running_tasks:
			gameManager.running_tasks.add(asyncio.create_task(gameManager.broadcast_game_state()))
		self.tournament = None
		await self.join_channel("all")
		await self.update_tournament_display()
		active_users.append(self)
		self.alias = "0"

	async def disconnect(self, code=None):
		global active_users
		if self.gameChannel and self.gameChannel.status == "on":
			await self.gameChannel.finish()
		if self.tournament and self.tournament.status != "end":
			await self.tournament.disconnect()
		await self.remove_channel("all")
		# active_users.remove(self.user_id)
		print("WEBOSCKET DISCONNECTED!!!!!")

	async def receive(self, text_data):
		data = json.loads(text_data)
		if data["channel"] == "game":
			print("game:", data)
			await self.gameChannel.receive(self, data)

		elif data["channel"] == "tournament":
			from .tournamentChannel import pending_tournament
			if data["action"] == "create":
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
			# elif data["action"] == "confirm participation" and "tour_id" in data:
			# 	await ongoing_tournaments[data["tour_id"]].confirm_participation(self)
			elif data["action"] == "finish" and self.tournament != None:
				await self.tournament.disconnect(self)
				await self.gameChannel.finish()


	async def update_tournament_display(self):
		print("updating the display....")
		from .tournamentChannel import pending_tournament
		if pending_tournament == None:
			print('create')
			await self.send_self({
				"type" : "tour.updates",
				"update_tour_registration" : "create",
				"button" : "create",
			})
		#paying
		elif self in pending_tournament.registered_players:
			print('subscribe')
			await self.send_self({
				"type" : "tour.updates",
				"update_tour_registration" : "join",
				"button" : "subscribed",
				"prize_pool" : pending_tournament.prize_pool,
				"now" : timezone.now().isoformat(),
				"start" : pending_tournament.start_time.isoformat()
			})
		elif pending_tournament.status == "locked":
			print('locke')
			await self.send_self({
				"type" : "tour.updates",
				"update_tour_registration" : "join",
				"button" : "locked",
				"prize_pool" : pending_tournament.prize_pool,
				"now" : timezone.now().isoformat(),
				"start" : pending_tournament.start_time.isoformat()
			})
		else:
			print('join')
			await self.send_self({
				"type" : "tour.updates",
				"update_tour_registration" : "join",
				"button" : "join",
				"prize_pool" : pending_tournament.prize_pool,
				"now" : timezone.now().isoformat(),
				"start" : pending_tournament.start_time.isoformat()
			})


	async def join_channel(self, room):
		print(f"Joining group {room} with channel name: {self.channel_name}")
		await self.channel_layer.group_add(room, self.channel_name)

	async def remove_channel(self, room):
		await self.channel_layer.group_discard(room, self.channel_name)

	async def send_channel(self, room, message):
		await self.channel_layer.group_send(room, message)

	async def send_self(self, message):
		await self.send(text_data=json.dumps(message))
	
	async def game_updates(self, event):
		await self.gameChannel.game_updates(event)

	async def tour_updates(self, event):
		print("updates from channel!")
		await self.send(text_data=json.dumps(event))
	
	def live_tournament(self, event):
		self.tournament = event.current
			


