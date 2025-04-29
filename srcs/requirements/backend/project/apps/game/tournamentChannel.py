import json, asyncio, time, math, random
from channels.layers import get_channel_layer
from rest_framework.test import APIRequestFactory
from uuid import uuid4, uuid1
from django.utils import timezone
from django.core.cache import cache

#constants
waitTime = 15
notificationTime = 5
fadeOutTime = 0.5
controlsTime = 1
matchmakeTime = 1
entry_price = 100
max_players = 1024
min_players = 2


_token = object()

#plaeholder TODO
fake_alias = 0
async def get_alias(user_id):
	global fake_alias

	fake_alias = fake_alias + 1
	return (f"p{fake_alias}")

class TournamentManager():	
	_instance = None
	_auth_token = _token

	def __new__(cls):
		if cls._instance is None:
			cls._instance = super(TournamentManager, cls).__new__(cls)
			cls._instance._tournaments = {}
		return cls._instance

	def _check_access(self, token):
		if token is not self._auth_token:
			raise PermissionError("Unauthorized access to TournamentManager.")

	def get(self):
		return self._tournaments

	def get_tournament(self, tournament_id = None):
		if tournament_id == None or tournament_id not in self._tournaments:
			return None
		return self._tournaments[tournament_id]

	def add_tournament(self, tournament_obj, token = None):
		self._check_access(token)
		self._tournaments[tournament_obj.tour_id] = tournament_obj

	def remove_tournament(self, tournament_id, token = None):
		self._check_access(token)
		if tournament_id in self._tournaments:
			del self._tournaments[tournament_id]

class TournamentChannel():
	def __init__(self, consumer):
		global waitTime, _token

		self.fadeOut = False
		self.prize_pool = 0
		self.tour_id = str(uuid4())
		self.registeredRoom = f"registered_tour_{self.tour_id}"
		self.playersRoom = f"players_tour_{self.tour_id}"
		self.status = "open"
		self.registered = {}
		self.players = {}
		self.now_playing = []
		self.now_waiting = []
		cache.set("pending_tournament", self.tour_id)
		TournamentManager().add_tournament(self, _token)
		self.start_time = timezone.now() + timezone.timedelta(seconds=waitTime)

	async def join(self, consumer):
		global max_players

		if len(self.registered) < max_players:
			await consumer.send_self({"type" : "tour.updates",
			"update_display" : "pay", "tour_id" : self.tour_id})
		else:
			await get_channel_layer().group_send("all", {"type" : "tour.updates",
			"update_tour_registration" : "join", "button" : "full"})
	
	async def confirm_payment(self, consumer, alias):
		global entry_price, max_players

		self.registered[consumer.user_id] = {"user" : consumer, "alias":alias}
		self.prize_pool += entry_price * 0.95
		await consumer.send_self({ "type" : "tour.updates",
			"update_tour_registration" : "join", "button" : "subscribed", "id":self.tour_id})
		if len(self.registered) < max_players:
			await get_channel_layer().group_send("all", {"type" : "tour.updates",
			"update_tour_registration" : "join", "prize_pool": self.prize_pool})
		else:
			await get_channel_layer().group_send("all", {"type" : "tour.updates",
			"update_tour_registration" : "join",  "button" : "full", "prize_pool": self.prize_pool})
		await consumer.join_channel(self.registeredRoom)
		consumer.update_user_data({"action":"set", "key":"tournament", "value": self.tour_id})
	
	async def notify_start(self):
		global waitTime, notificationTime

		await asyncio.sleep(waitTime - notificationTime)
		self.status = "locked"
		if len(self.registered) > 0:
			await get_channel_layer().group_send(f"{self.registeredRoom}", {"type" : "tour.updates",
				"notification" : "start"})
		await get_channel_layer().group_send("all", {"type" : "tour.updates",
			"update_tour_registration" : "join", "button" : "locked"})

	async def fade_out_notification(self):
		global waitTime, fadeOutTime

		self.fadeout = True
		await asyncio.sleep(waitTime - fadeOutTime - 0.5)
		if len(self.registered) > 0:
			await get_channel_layer().group_send(f"{self.registeredRoom}", {"type" : "tour.updates",
				"notification" : "fadeOut", "length" : fadeOutTime})

	async def start(self):
		global waitTime, min_players, _token, controlsTime

		await asyncio.sleep(waitTime)
		
		#allow new tournament registration
		cache.delete("pending_tournament")
		await get_channel_layer().group_send("all", {"type" : "tour.updates",
			"update_tour_registration" : "create", "button" : "create"})
		await get_channel_layer().group_send(f"{self.registeredRoom}", {"type" : "tour.updates",
			"update_tour_registration" : "exit redirection alert"})
		#get registered users who are "active"
		# [players{id:user}, now_waiting[id], playersRoom]
		active_users = cache.get('active_users')
		if active_users == None:
			active_users = []
		for user_id in self.registered:
			user = self.registered[user_id]["user"]
			await user.remove_channel(self.registeredRoom)
			if user_id in active_users:
				self.players[user_id] = self.registered[user_id]
				self.now_waiting.append(user.user_id)
				await user.join_channel(self.playersRoom)

		#not enough players ? refund | cancel
		if len(self.players) == 1:
			print("one player, refund")
			print("self.nowaitning[0[]]", self.now_waiting[0])
			await get_channel_layer().group_send(f"{self.now_waiting[0]}", {"type" : "tour.updates",
				"update_display" : "refund", "reason" : "insufficient players"})
			await self.remove_player(self.now_waiting[0])
		if len(self.players) <= 1:
			print("1 or less players, tournament cancelled")
			# cache.set("pending_tournament", None)
			TournamentManager().remove_tournament(self.tour_id, _token)
			return

		#start tournament
		print("start torunament")
		self.status = "active"
		await get_channel_layer().group_send(f"{self.playersRoom}", {
			"type": "tour.updates",
			"update_display" : "controls",
		})
		print("start controls")
		await asyncio.sleep(controlsTime)
		print("end controls")
		random.shuffle(self.now_waiting)
		self.current_round = 0
		await self.matchmake()
	

	async def matchmake(self):
		global matchmakeTime

		print("mathmake")
		self.status = "matchmake"

		#send next round plan
		self.current_round += 1
		self.total_matches = len(self.now_waiting) // 2
		names = [self.players[user_id]["alias"] for user_id in self.now_waiting]
		await get_channel_layer().group_send(f"{self.playersRoom}", {
			"type" : "tour.updates",
			"update_display" : "matchmaking rounds",
			"total matches" : self.total_matches,
			"current round" : self.current_round,
			"players" : names
		})

		#wait for display
		await asyncio.sleep(matchmakeTime)
		print("end matchmake")

		#send players to their matches in groups of 2
		while len(self.now_waiting) >= 2:
			await self.start_remote_game(self.now_waiting.pop(), self.now_waiting.pop())
		
		#send lone player to waiting room
		print("is alone?")
		if len(self.now_waiting) == 1:
			print("loner should wait... ")
			if await self.tournament_winner(self.now_waiting[0]) == False :
				print("waiting...")
				await self.players[self.now_waiting[0]]["user"].send_self({
					"type": "tour.updates",
					"update_display" : 'waiting'
				})
	
		self.status == "playing"


	async def start_remote_game(self, player1_id, player2_id):
		from .registration import new_game

		# add to now_playing array
		self.now_playing.append(player1_id)
		self.now_playing.append(player2_id)

		# start game
		if player1_id in self.players and player2_id in self.players: 
			print("start remote game")
			await new_game({
				"type": "remote", 
				"userID1": player1_id,
				"userID2": player2_id,
				"alias1" : self.players[player1_id]["alias"],
				"alias2" : self.players[player2_id]["alias"],
				"tour_id": self.tour_id,
			})
		elif len(self.players) == 0:
			print("split prize, 2 disconnections final round")
			await self.tournament_winner(player1_id, "player disconnected", 0.5)
			await self.tournament_winner(player2_id, "player disconnected", 0.5)
		else:
			print("disconnections")
			if player1_id in self.players:
				await self.match_winner(player1_id, "player disconnected")
			else:
				await self.match_looser(player1_id)
			if player2_id in self.players:
				await self.match_winner(player2_id, "player disconnected")
			else:
				await self.match_looser(player2_id)


	async def remove_player(self, player_id):

		if player_id not in self.players:
			return
		consumer = self.players[player_id]["user"]
		await consumer.remove_channel(self.playersRoom)
		consumer.update_user_data({"action":"set", "key":"tournament", "value": None})
		del self.players[player_id]
		if self.now_waiting and player_id in self.now_waiting:
			self.now_waiting.remove(player_id)
		if self.now_playing and player_id in self.now_playing:
			self.now_playing.remove(player_id)
		print("end remove player")
		

	async def match_looser(self, player_id):
		print("match looser")
		#send end message
		if player_id in self.players:
			await self.players[player_id]["user"].send_self({
				"type":"tour.updates",
				"update_display":"end game",
				"title":f"You have lost round {self.current_round}",
				"button":"exit",
			})
			await self.remove_player(player_id)


	async def match_winner(self, player_id, error, can_be_champion = True):
		print("match winner")
		#is it tournament winner?
		if can_be_champion and await self.tournament_winner(player_id, error) == True:
			return
		
		#add player to waiting
		if player_id in self.players:
			self.now_waiting.append(player_id)
			#send winning message
			await self.players[player_id]["user"].send_self({
				"type":"tour.updates",
				"update_display":"end game",
				"title":f"You have won round {self.current_round}",
				"error":error,
				"button":"wait",
			})

	async def tournament_winner(self, player_id, error = ""):
		global _token

		print("tournametn winner")
		#check if there are other users now playing or waiting to play
		if len(self.now_playing) > 0:
			return False
		if len(self.now_waiting) > 0 and not (len(self.now_waiting) == 1 and self.now_waiting[0] == player_id):
			return False
		#send winning message
		if player_id in self.players:
			await self.players[player_id]["user"].send_self({
				"type":"tour.updates",
				"update_display":"end game",
				"title":"CHAMPION!",
				"error":error,
				"prize":self.prize_pool,
				"button":"exit",
			})
			await self.remove_player(player_id)
		#store results TODO
		results = {
			"winner" : player_id,
			"participants" : self.registered,
			"prize pool" : self.prize_pool,
		}
		#clean
		self.status = "end"
		TournamentManager().remove_tournament(self.tour_id, _token)
		return True

	async def end_remote_game(self, data):
		print("end remote game")
	
		#remove players from now_playing
		for player in data["players"]:
			if player["id"] in self.now_playing:
				self.now_playing.remove(player["id"])
		
		#handle wins | loses | draws
		for player in data["players"]:
			if player["result"] == "loose":
				await self.match_looser(player["id"])
			elif player["result"] == "win":
				await self.match_winner(player["id"], data["error"], 1)
			elif player["result"] == "draw":
				await self.match_winner(player["id"], data["error"], 0.5)

		print("should continue?")
		if len(self.now_playing) == 0 and len(self.now_waiting) > 0:
			print("about to start: ", self.now_waiting)
			await asyncio.sleep(4)
			await self.matchmake()

	# async def disconnect(self, consumer):
	# 	print("touranment disconnect")
		# await self.remove_player(consumer.user_id)