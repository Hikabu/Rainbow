from .registration import get_expected_players, store_game_results
import json, asyncio, time
from .logic_main import GameLogic
from channels.layers import get_channel_layer
import asyncio
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)

logger = logging.getLogger(__name__)
class GameManager:
	_instance = None

	def __new__(cls):
		if cls._instance is None:
			cls._instance = super(GameManager, cls).__new__(cls)
			cls._instance._all_games = {}
			cls._instance._active_games = []
			cls._instance._finished_games = []
			cls._instance._new_games = []
			cls._instance._new_games_lock = asyncio.Lock()
			cls._instance._finished_games_lock = asyncio.Lock()
			cls._routine_start = False
			print("start task routine")
		return cls._instance

	def get_game(self, game_id=None):
		if game_id == None:
			return None
		if game_id in self._all_games:
			return self._all_games[game_id]
		return None

	def add_game(self, game):
		if game.game_id in self._all_games:
			return
		self._all_games[game.game_id] = game
	
	async def add_routine_game(self, game_id):
		async with self._new_games_lock:
			self._new_games.append(game_id)
		if self._routine_start == False:
			asyncio.create_task(self._routine())
			self._routine_start = True

	async def delete_game(self, game_id):
		async with self._finished_games_lock:
			self._finished_games.append(game_id)
		if game_id in self._all_games:
			del self._all_games[game_id]
		print("deleted game!")

	async def _routine(self):
		print("")
		print("start routine")
		print("")
		while True:
			try:
				async with self._new_games_lock:
					# add new games to active
					if self._new_games:
						self._active_games.extend(self._new_games)
						self._new_games.clear()

				async with self._finished_games_lock:
					# remove finished games from active
					for game_id in self._finished_games:
						print("attempt to delete")
						if game_id in self._active_games:
							print("Delete!")
							self._active_games.remove(game_id)
					self._finished_games.clear()

				# check active
				for game_id in self._active_games:
					if game_id not in self._all_games:
						print("no game id?")
						return
					game = self._all_games[game_id]
					if game.status == "active":
						await game.logic_updates()
					elif game.status == "pending":
						await game.check_pending()

				await asyncio.sleep(0.016) #breathing room 

			except Exception as e:
				print(f"Error in game loop: {e}")
				break

class GameChannel():
	def __init__(self, game_id, game_mode):
		print("CREATING NEW GAME CHANNEL")
		self.game_mode = game_mode
		self.game_id = game_id
		self.room = f"game_{game_id}"
		self.active_players = []
		self.disconnected_players = []
		self.expected_players_id = get_expected_players(game_id, "id")
		self.names = get_expected_players(game_id, "alias")
		self.status = "pending"
		self.start_time = None
		self.logic = None

	async def join(self, consumer):
		if self.status == "finished":
			return False
		if int(consumer.user_id) not in [int(x) for x in self.expected_players_id]:
			return False
		if self.status != "pending":
			return False
		if consumer.user_id in self.active_players:
			return True
		await consumer.join_channel(self.room)
		consumer.game = self
		consumer.update_user_data({"action":"set", "key":"game", "value":self.game_id})
		self.active_players.append(consumer.user_id)
		if len(self.active_players) == len(self.expected_players_id):
			await self.start_game()
		return True
	
	async def check_pending(self):
		from .consumers import max_reconnection_time

		if self.start_time - time.time() > max_reconnection_time:
			self.error_end("player did not join")

		elif len(self.active_players) == len(self.expected_players_id):
			await self.start_game()
	
	async def start_game(self):
		self.status = "starting"
		# await GameManager().add_active_game(self.game_id)
		await get_channel_layer().group_send(self.room, {"type": "game.updates", 
			"state" : "player names", 
			"name1" : self.names[0], 
			"name2" : self.names[1],
			"total_players" : len(self.expected_players_id),
		})
		self.logic = GameLogic(self.game_id)
		self.status = "active"

	async def logic_updates(self):
		updates = self.logic.update_state()
		if updates:
			await get_channel_layer().group_send(self.room, {"type" : "game.updates",
			"updates" : updates})
			if updates["state"] == "game end":
				print("GAME END")
				await store_game_results({
					"score1":updates["score1"],
					"score2":updates["score2"],
					"start_time" : self.logic.start_time,
					"gameID" : self.game_id,
					"connected" : self.active_players,
					"error" : updates.get("error", ""),
				})
				await self.finish()

	async def finish(self):
		if self.status == "finished":
			return
		self.status = "finished"
		await GameManager().delete_game(self.game_id)
		await get_channel_layer().group_send(self.room, {"type" : "game.updates",
		"action" : "delete game"})
	
	async def disconnect(self, consumer):
		if consumer.game:
			consumer.update_user_data({"action" : "set", "game" : None})
		if self.status == "finished":
			return
		self.active_players.remove(consumer.user_id)
		self.disconnected_players.append(consumer.user_id)
		await self.error_end("player disconnected")
		#moved below before it was above error end
		await consumer.remove_channel(self.room)
		consumer.update_user_data({"action" : "set", "key" : "game", "value" : None})
	

	async def error_end(self, error):
		if self.status == "finished":
			return
		if self.logic:
			start_time = self.logic.start_time
		else:
			start_time = self.start_time
		await store_game_results({
				"error": error,
				"gameID" : self.game_id,
				"start_time" : start_time,
				"looser" : self.disconnected_players[0],
				"score1" : "",
				"score2" : "",
			})
		await get_channel_layer().group_send(self.room, {"type" : "game.updates",
			"error" : error,
			"game end" : True,
		})
		await self.finish()


async def join_game_channel(consumer, game_id):
	game = GameManager().get_game(game_id)
	if game:
		if await game.join(consumer):
			return game
	return None

async def create_game_channel(game_id, game_mode):
	new_game = GameChannel(game_id, game_mode)
	GameManager().add_game(new_game)
	new_game.start_time = time.time()
	await GameManager().add_routine_game(game_id)
