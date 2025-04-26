import json, asyncio, time
from channels.layers import get_channel_layer
from .game import Game
from .playLog import get_max_players, get_player_alias, store_game_results
from django.core.cache import cache

active_sessions = {}
pending_sessions = {}
active_connections = {}
players = {}

class GameManager():
	def __init__(self):
		self.pending_timeout = 1
		self.running_tasks = set()

	async def broadcast_game_state(self):
		while True:
			try:
				for gameID, game in active_sessions.items():
					updates = game.update_state()
					if updates:
						await get_channel_layer().group_send(f"game_{gameID}", {"type": "game.updates", "updates": updates})
						if updates["state"] == "game end":
							print("store game results///")
							await store_game_results({"score1" : updates["score1"], "score2" : updates["score2"], "start_time" : game.start_time, "gameID" : gameID,})
							print("end store")
							active_sessions.pop(gameID, None)
							pending_sessions.pop(gameID, None)
							break
				for gameID, start_time in pending_sessions.items():
					if gameID in active_sessions:
						pending_sessions.pop(gameID, None)
						break
					if time.time() - start_time > self.pending_timeout:
						await get_channel_layer().group_send(f"game_{gameID}", {"type": "game.updates", "updates": {"state" : "error", "info" : "player disconnected", "score1":"", "score2":"", "start_time": start_time}})
						pending_sessions.pop(gameID, None)
						break 

				await asyncio.sleep(0.016)  # ~60 updates per second
			except Exception as e:
				print(f"Error in game loop: {e}")
				break
		self.running_tasks.clear()

gameManager = GameManager()

class GameChannel():
	def __init__(self):
		self.status = "uninitialized"

	async def start_game(self, consumer, gameID):
		self.status = "on"
		self.consumer = consumer
		self.gameID = gameID
		self.user_id = consumer.user_id
		self.reconnected = False
		await self.manage_user_multitab()
		await self.consumer.join_channel(f"game_{self.gameID}")
		await self.verify_user()
		print("add player")
		players[self.gameID]["ready"] += 1
		print("players: ", players[self.gameID])
		if self.reconnected == True:
			active_sessions[self.gameID] = self.old_game
			active_connections[self.user_id] = self
			ready_connections[self.gameID] += 1
		if players[self.gameID]["ready"] == self.max_players:
			print("ready to start")
			active_sessions[self.gameID] = Game(self.gameID)
			names = get_player_alias(self.gameID)
			await self.consumer.send_channel(f"game_{self.gameID}", {"type": "game.updates", "updates": {"state" : "player names", "name1" : names[0], "name2" : names[1]}})
		else:
			pending_sessions[self.gameID] = time.time()

	async def verify_user(self):
		if self.gameID not in players:
			players[self.gameID] = {"connected" : 0, "ready" : 0}
		self.max_players = get_max_players(self.gameID)
		print("max players: ", self.max_players)
		print("players: ", players[self.gameID])
		players[self.gameID]["connected"] += 1
		print("players: ", players[self.gameID])
		if players[self.gameID]["connected"] > self.max_players:
			await self.finish()
		
	async def manage_user_multitab(self):
		if self.user_id in active_connections:
			old_connection = active_connections[self.user_id]
			if self.gameID in active_sessions:
				self.old_game = active_sessions[self.gameID]
				self.reconnected = True
			await old_connection.close()
		else:
			active_connections[self.user_id] = self

	async def finish(self):
		if self.status == "uninitialized" or self.status == "off":
			print("return in finish")
			return
		self.status = "off"
		active_connections.pop(self.user_id, None)
		if self.gameID in active_sessions:
			if active_sessions[self.gameID].active == True:
				await self.consumer.send_channel(f"game_{self.gameID}", {"type": "game.updates", "updates": {"state" : "error", "info" : "player disconnected", "score1" : active_sessions[self.gameID].paddles[-1].score, "score2":active_sessions[self.gameID].paddles[1].score, "start_time":active_sessions[self.gameID].start_time}})
			del active_sessions[self.gameID]
			pending_sessions.pop(self.gameID, None)
		elif self.gameID in pending_sessions:
			print("gme calls store err1")
			await store_game_results({"error":"player disconnected", "looser": self.user_id, "gameID":self.gameID, "score1" : "", "score2" : "", "start_time": pending_sessions[self.gameID]})
			del pending_sessions[self.gameID]
		if players.get(self.gameID):
			players[self.gameID]["connected"] -= 1
			players[self.gameID]["ready"] -= 1
			if players[self.gameID]["connected"] == 0:
				del players[self.gameID]
		await self.consumer.remove_channel(f"game_{self.gameID}")

	async def receive(self, consumer, data):
		if "boundaries" in data:
			self.dimensions = data["boundaries"]
		if "request" in data:
			if data["request"] == "start game":
				await self.start_game(consumer, data["game_id"])
			if data["request"] == "update paddles":
				active_sessions[self.gameID].update_paddles(data)
			if data["request"] == "end game" :
				await self.finish()

		
	async def game_updates(self, event):
		updates = event["updates"]
		if (updates["state"] == "error"):
			await self.consumer.send_self(json.dumps({
							"type": "live.game.updates",
							"updates": {"state" : updates["state"], "info" : updates["info"]}
						}))
			print("gm calls store err 2")
			await store_game_results({"error":updates["info"], "winner": self.user_id, "gameID":self.gameID, "score1" : updates["score1"], "score2" : updates["score2"], "start_time": updates["start_time"]})
			await self.finish()
		elif (updates["state"] == "playing" or updates["state"] == "game end"):
			await self.consumer.send_self({
							"type": "live.game.updates",
							"updates": {
								"ball" : {
									"x" : updates["x"][0]  * self.dimensions["x"], 
									"y" : updates["y"][0] * self.dimensions["y"],
								},
								"paddle_left" : updates["y"][1] * self.dimensions["y"],
								"paddle_right" : updates["y"][2] * self.dimensions["y"],
								"score1" : updates["score1"],
								"score2" : updates["score2"],
								"state" : updates["state"],
							}
						})
			if (updates["state"] == "game end"):
				await self.finish()
		else:
			await self.consumer.send_self({
							"type": "live.game.updates",
							"updates": updates,
						})
