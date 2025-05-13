
from rest_framework.decorators import api_view
from rest_framework.response import Response
from uuid import uuid4, uuid1
from datetime import date
from django.core.cache import cache
from django.contrib.auth import get_user_model
from .tournamentChannel import TournamentManager
from asgiref.sync import sync_to_async
from django.utils import timezone
from datetime import datetime
from channels.layers import get_channel_layer
from project.apps.intrauth.models import GameResult, Profile
import logging


User = get_user_model()
logger = logging.getLogger(__name__)
async def can_user_log_game(consumer, data):
	playing_users = cache.get(f"playing_users")
	if playing_users == None:
		playing_users = []
	if consumer.user_id in playing_users:
		await get_channel_layer().group_send(f"{consumer.user_id}" ,{"type" : "game.updates",
		"update_display" : "already_in_game",
		})
	else:
		await get_channel_layer().group_send(f"{consumer.user_id}" ,{"type" : "game.updates",
		"update_display" : "controls",
		"state" : data["state"]
		})

async def new_game(data):
	from .gameChannel import create_game_channel

	log = create_new_log()
	log['type'] = data.get('type')
	log['players']['max'] = 1 if log['type'] in ['local', 'AI'] else 2
	log['players']['1'] = create_new_player(data, data.get('userID1'), data.get('alias1'), 1)				
	log['players']['2'] = create_new_player(data, data.get('userID2', 'userID1'), data.get('alias2'), 2)
	player_mode = log["type"]
	if log["type"] == 'remote':
		log["tour_id"] = data.get('tour_id')

	#check if user is already in game?
	if log['type'] in ['local', 'AI']:
		playing_users = cache.get(f"playing_users")
		if playing_users == None:
			playing_users = []
		if data['userID1'] in playing_users:
			await cancel_game(data) 
			return
		playing_users.append(data.get('userID1'))
		cache.set("playing_users", playing_users)
	
	cache.set(f"game_log:{log['gameID']}", log)

	#create game and inform user...
	await create_game_channel(log["gameID"], data.get("type"))
	await get_channel_layer().group_send(f"{data.get('userID1')}", {
		"type" : "game.updates",
		"update_display" : "start game",
		"gameID" : log["gameID"],
		"userID" : data["userID1"],
		"game-type" : log["type"] if log["type"] != "remote" else "player1",
	})
	if data.get('userID2'):
		await get_channel_layer().group_send(f"{data.get('userID2')}", {
			"type" : "game.updates",
			"update_display" : "start game",
			"gameID" : log["gameID"],
			"userID" : data["userID2"],
			"game-type" : "player2",
		})

async def cancel_game(data):
	message = {
		"type" : "game.updates",
		"update_display" : "cancel game",
		"reason" : "already playing a game",
	}
	await get_channel_layer().group_send(f"{data.get('userID1')}", message)
	if data.get('type') not in ["local", "AI"]:
		await get_channel_layer().group_send(f"{data.get('userID2')}", message)

async def store_game_results(results):
    
	log = cache.get(f"game_log:{results['gameID']}")
	if log == None:
		return
	playing_users = cache.get("playing_users")
	if playing_users:
		if log["players"]["1"]["id"] in playing_users:
			playing_users.remove(log["players"]["1"]["id"])
		cache.set("playing_users", playing_users)
	if "error" in results and results["error"] != "":
		log["error"] = results["error"]
		log["start_time"] = results["start_time"]
		if "winner" in results:
			if results["winner"] == log["players"]["1"]["id"]:
				log["players"]["1"]["result"] = "win"
				log["players"]["1"]["score"] = 0
				log["players"]["2"]["result"] = "loose"
				log["players"]["2"]["score"] = -1
			elif results["winner"] == log["players"]["2"]["id"]:
				log["players"]["1"]["result"] = "loose"
				log["players"]["1"]["score"] = -1
				log["players"]["2"]["result"] = "win"
				log["players"]["2"]["score"] = 0
		elif "looser" in results:
			if results["looser"] == log["players"]["1"]["id"]:
				log["players"]["1"]["result"] = "loose"
				log["players"]["1"]["score"] = -1
				log["players"]["2"]["result"] = "win"
				log["players"]["2"]["score"] = 0
			elif results["looser"] == log["players"]["2"]["id"]:
				log["players"]["1"]["result"] = "win"
				log["players"]["1"]["score"] = 0
				log["players"]["2"]["result"] = "loose"
				log["players"]["2"]["score"] = -1
		if results["score1"] and results["score2"]:
			log["players"]["1"]["score"] = results["score1"]
			log["players"]["2"]["score"] = results["score2"]

	else:	
		log['start_time'] = results["start_time"]
		log['players']['1']['score'] = results["score1"]
		log['players']['2']['score'] = results["score2"]
		if (results["score1"] > results["score2"]):
			log['players']['1']["result"] = "win"
			log['players']['2']["result"] = "loose"
		elif (results["score1"] < results["score2"]):
			log['players']['1']["result"] = "loose"
			log['players']['2']["result"] = "win"
		else:
			log['players']['1']["result"] = "draw"
			log['players']['2']["result"] = "draw"

	if log["type"] == "remote":
		tour = TournamentManager().get_tournament(log["tour_id"])
		if tour :
			await tour.end_remote_game({
				"players" :  [log['players']['1'], log['players']['2']],
				"error" : results.get("error", "")
			})
 
	logger.debug(f"the results are: {log}")

	game_id = results["gameID"]
	player1_data = log['players']['1']
	player2_data = log['players']['2']
	
	player1 = await sync_to_async(User.objects.get)(id=player1_data['id'])
	player2 = None
	if isinstance(player2_data['id'],int):
		player2 = await sync_to_async(User.objects.get)(id=player2_data['id'])
	logger.debug(f"the results are: {log}")
	game = (GameResult(
  		game_id=game_id,
		game_type=log["type"],
		start_time=results["start_time"],
		user = player1, 
		user_score = player1_data['score'], 
		user_result = player1_data['result'],
		player2 = player2,
		player2_alias =player2_data['alias'] if not player2 else '', 
		player2_score = player2_data['score'],
		player2_result = player2_data['result'],
	))
	await sync_to_async(game.save)()
	await profile_status(player1, player1_data['result'])
	if player2:
		await profile_status(player2, player2_data['result'])
 
	cache.delete(f"game_log:{results['gameID']}")

@sync_to_async
def profile_status(user, result):
	profile = Profile.objects.get(user=user)
	if result == "win":
		profile.wins +=1
	elif result == "loose":
		profile.losses +=1
	profile.save()

def create_new_log():
	return {
		"gameID": str(uuid4()),
		"type": "",
		"players": {
			"1": {},
			"2": {},
			"max": 2
		},
		"start_time": "",
		"error": "",
		"full" : False,
	}

def create_new_player(data, userID, alias, n):
	player={
		"id": "", 
		"username": "",
		"alias": "",
		"score": 0,
		"result": ""
	}
	player["id"] = userID 
	player["username"] = data.get("username")
	player["alias"] =  alias
	return player

def	get_expected_players(gameID, key):
	log = cache.get(f"game_log:{gameID}")
	if not log:
		return None
	if key == "id" and log["players"]["max"] == 1:
		return [log["players"]["1"]["id"]]
	elif key == "id" and log["players"]["max"] == 2:
		return [log["players"]["1"]["id"], log["players"]["2"]["id"]]
	elif key == "alias":
		return [log["players"]["1"]["alias"], log["players"]["2"]["alias"]] if log else None
	return None

def get_paddle_type(gameID, side):
	log = cache.get(f"game_log:{gameID}")
	if log:
		if log["type"] == "AI" and side == 1:
			return "AI"
		if log["type"] == "remote" and side == -1:
			return "player1"
		if log["type"] == "remote" and side == 1:
			return "player2"
	return "local"