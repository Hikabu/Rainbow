import json, asyncio, time, math, random
from channels.layers import get_channel_layer
from rest_framework.test import APIRequestFactory
from uuid import uuid4, uuid1
from .channels import send_message
from django.utils import timezone


#short term storage
ongoing_tournaments = {}
pending_tournament = None

#constants
waitTime = 30
notificationTime = 5
entry_price = 100
max_players = 1024
min_players = 2

class TournamentChannel():
	def __init__(self, consumer):
		global pending_tournament, ongoing_tournaments

		self.prize_pool = 0
		self.tour_id = str(uuid4())
		self.registeredRoom = f"registered_tour_{self.tour_id}"
		self.remainingRoom = f"remaining_tour_{self.tour_id}"
		self.status = "open"
		self.registered_players = []
		self.remaining_players = []
		pending_tournament = self
		ongoing_tournaments[self.tour_id] = self
		self.consumer = consumer
		self.start_time = timezone.now() + timezone.timedelta(seconds=waitTime)
		# self.registered_user = None

	async def join(self, consumer):
		if len(self.registered_players) < max_players:
			await consumer.send_self({"type" : "tour.updates",
			"update_display" : "pay", "tour_id" : self.tour_id})
		else:
			await consumer.send_channel("all", {"type" : "tour.updates",
			"update_tour_registration" : "join", "button" : "full"})
	
	async def confirm_payment(self, consumer):
		# self.registered_players.append(consumer.user_id)
		self.registered_players.append(consumer)
		self.prize_pool += entry_price * 0.95
		await consumer.send_self({ "type" : "tour.updates",
			"update_tour_registration" : "join", "button" : "subscribed"})
		if len(self.registered_players) < max_players:
			await consumer.send_channel("all", {"type" : "tour.updates",
			"update_tour_registration" : "join", "prize_pool": self.prize_pool})
		else:
			await consumer.send_channel("all", {"type" : "tour.updates",
			"update_tour_registration" : "join",  "button" : "full", "prize_pool": self.prize_pool})
		await consumer.join_channel(self.registeredRoom)
	
	async def notify_start(self):
		global waitTime, notificationTime

		await asyncio.sleep(waitTime - notificationTime)
		self.status = "locked"
		if len(self.registered_players) > 0:
			await self.registered_players[0].send_channel(self.registeredRoom, {"type" : "tour.updates",
				"notification" : "start", "length" : notificationTime})
		await self.consumer.send_channel("all", {"type" : "tour.updates",
			"update_tour_registration" : "join", "button" : "locked"})
	
	async def start(self):
		from .consumers import active_users 
		global ongoing_tournaments, pending_tournament, waitTime, min_players

		await asyncio.sleep(waitTime)
		print("START")
		#restart new tournament - create option
		pending_tournament = None
		await self.consumer.send_channel("all", {"type" : "tour.updates",
			"update_tour_registration" : "create", "button" : "create"})
		#get all confirmed registered players
		for user in self.registered_players:
			if user in active_users:
				print(user)
				print(user.alias)
				user.alias = "alias0"
				self.remaining_players.append(user)
				await user.join_channel(self.remainingRoom)
		# 	else:
		# 		remove_channel(user, self.remainingRoom)
		#self.remaining_players = [user for user in self.registered_players if user in active_users]
		print("total players registered: ", len(self.registered_players))
		print("total players confirmed: ", len(self.remaining_players))
		#edge case cancel refund
		if len(self.remaining_players) == 1:
			print("refund")
			await self.remaining_players[0].send_self({"type" : "tour.updates",
				"update_display" : "refund", "reason" : "insufficient players"})
		#edge case cancel empty
		if len(self.remaining_players) < min_players:
			print("tournament cancelled")
			del ongoing_tournaments[self.tour_id]
		else :
			print("tournant ongoing...")
			print("CONF players: ", self.remaining_players)
			random.shuffle(self.remaining_players)
			print("remiainng players: ", self.remaining_players)
			self.current_round = 0
			self.max_rounds = math.ceil(math.log2(len(self.remaining_players)))
			await self.matchmake()

	async def matchmake(self):
		print("matchamke")
		self.current_round += 1
		print("remianining players: ", len(self.remaining_players))
		self.total_matches = len(self.remaining_players) // 2 #+ len(self.remaining_players % 2)
		await self.remaining_players[0].send_channel(self.remainingRoom, {
			"type" : "tour.updates",
			"update_display" : "matchmaking rounds",
			"total matches" : self.total_matches,
			"current round" : self.current_round,
			"max rounds" : self.max_rounds,
			"players" : [user.alias for user in self.remaining_players]
		})
		print("total matches: ", self.total_matches)
		print("before sleep...")
		await asyncio.sleep(5)
		print('after sleep...')
		while len(self.remaining_players) >= 2:
			await self.start_remote_game(self.remaining_players.pop(), self.remaining_players.pop())
		if len(self.remaining_players) == 1:
			await self.remaining_players[0].send_self({"type": "tour.updates",
			"update_display" : 'waiting'})

	async def start_remote_game(self, player1, player2):
		from .playLog import new_game
		print("START TORUNAMENT MATCH")
		print("remianining players: ", len(self.remaining_players))
		print(player1.user_id)
		print(player2.user_id)

		response = new_game(APIRequestFactory().post("/api/new_game/", {
			"type": "remote", 
			"userID1": player1.user_id,
			"userID2": player2.user_id,
			"alias1": player1.alias,
			"alias2": player2.alias,
			"tour_id":self.tour_id,
			}, format='json'))
		print("the response: ", response)
		print("the data: ", response.data)
		data = response.data
		await player1.send_self({
			"type" : "tour.updates",
			"update_display" : "start game",
			"gameID" : data["gameID"],
			"userID" : data["userID"],
			"game-type" : "player1",
			})
		await player2.send_self({
			"type" : "tour.updates",
			"update_display" : "start game",
			"gameID" : data["gameID"],
			"userID" : data["userID2"],
			"game-type" : "player2",
			})

	async def end_remote_game(self, data):
		print("END TORUNAMENT MATCH")
		print("remianining players: ", len(self.remaining_players))
		print("received: ", data)
		winner = next((user for user in self.registered_players if user.user_id == data["winner"]), None)
		self.remaining_players.append(winner)
		print("remianining players + winner: ", len(self.remaining_players))
		looser = next((user for user in self.registered_players if user.user_id == data["looser"]), None)
		await looser.remove_channel(self.remainingRoom)
		print("winer: ", winner, winner.user_id)
		print("looser: ", looser, looser.user_id)
		self.total_matches -= 1
		print("matches left: ", self.total_matches)
		print("looser sent end game 1")
		await looser.send_self({
					"type":"tour.updates",
					"update_display":"end game",
					"title":f"You have lost round {self.current_round}",
					"button":"exit",
				})
		if self.total_matches == 0 and len(self.remaining_players) == 1:
				self.state = "end"
				print("winner sent end game 1")
				await winner.send_self({
					"type":"tour.updates",
					"update_display":"end game",
					"title":"You have won the tournament",
					"prize":self.prize_pool,
					"button":"exit",
				})
				await self.finish(winner)
				#blockhain send him payment! of self.prize_pool
				return
		else :
			print("winner sent end game cc")
			await winner.send_self({
					"type":"tour.updates",
					"update_display":"end game",
					"title":f"You have won round {self.current_round}",
					"button":"wait",
				})
		if self.total_matches == 0 :
			await self.matchmake()

	async def finish(self, winner):
		results = {
			"winner" : winner,
			"participants" : self.registered_players,
			"prize pool" : self.prize_pool,
		}
		# store_tournament_results(results)
		if self.status == "active":
			remaining_players.remove(self.consumer.user_id)
		self.state == "end"
		del ongoing_tournaments[self.tour_id]
		# await self.consumer.remove_channel(self.room)

	async def disconnect(self, consumer):
		if self.status == "active":
			remaining_players.remove(self.consumer.user_id)
			await consumer.remove_channel(self.remainingRoom)
			consumer.tournament = None



		

	# async def close_registration(self, consumer):
	# 	global pending_tournament
	# 	if self.status == "closed":
	# 		return
	# 	print("closing registration")
	# 	self.status = "closed"
	# 	pending_tournament = None
	# 	await self.consumer.send_channel("all", {
	# 		"type" : "tour.updates",
	# 		"update_tour_registration" : "create",
	# 		"button" : "create",
	# 	})
	# async def confirm_participation(self, consumer):
	# 	self.confirmed_players.append(consumer)
	# 	await consumer.join_channel(self.remainingRoom)