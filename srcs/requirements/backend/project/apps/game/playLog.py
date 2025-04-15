
from rest_framework.decorators import api_view
from rest_framework.response import Response
from uuid import uuid4, uuid1
import pprint

active_game_logs = {}

@api_view(['POST'])
def	new_game(request):
	global active_game_logs
	if request.method == 'POST':
		log = create_new_log()
		log['type'] = request.data.get('type')
		log['players']['max'] = 1 if log['type'] in ['local', 'AI'] else 2
		log['players']['1'] = create_new_player(request.data, request.data.get('userID1'), 1)				
		log['players']['2'] = create_new_player(request.data,request.data.get('userID2', 'userID1'), 2)
		player_mode = log["type"]
		if log["type"] == 'remote':
			log["tour_id"] = request.data.get('tour_id')

		active_game_logs[log['gameID']] = log
		# print("in playlog got this... ", request.data)
		# print("the log ... ", log)
		return Response({
			"userID" : log["players"]["1"]["id"],
			"userID2" : log["players"]["2"]["id"],
			"gameID" : log['gameID'],
			"player_mode": player_mode,
			"name1" : log["players"]["1"]["alias"],
			"name2" : log["players"]["2"]["alias"],
			}, status=201)


async def store_game_results(results):
	from .tournamentChannel import ongoing_tournaments
	global active_game_logs

	print("store called")
	if results["gameID"] not in active_game_logs:
		return
	log = active_game_logs[results["gameID"]]

	if "error" in results:
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
	# print("results: ", results)
	# print("log: ", log)
	if log["type"] == "remote":
		print("ot: ", ongoing_tournaments[log["tour_id"]])
		if log['players']['1']["result"] == "win" :
			await ongoing_tournaments[log["tour_id"]].end_remote_game({
				"winner" :  log['players']['1']['id'],
				"looser" :  log['players']['2']['id'],
			})
		else:
			await ongoing_tournaments[log["tour_id"]].end_remote_game({
				"looser" :  log['players']['1']['id'],
				"winner" :  log['players']['2']['id'],
			})

	# store log in data base ... 

	# pprint.pprint(log)	# end storage
	del active_game_logs[results["gameID"]]

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

def create_new_player(data, userID, n):
	player={
		"id": "", 
		"username": "",
		"alias": "",
		"score": 0,
		"result": ""
	}
	player["id"] = userID
	player["username"] = data.get("username")
	player["alias"] = data.get("alias{}".format(n)) or player["username"]
	#add alias from display name if no tthis then player username
	if data.get('type') == "AI":
		player["alias"] = "Computer"
	return player

def	get_max_players(gameID):
	return active_game_logs[gameID]["players"]["max"]

def get_paddle_type(gameID, side):
	if active_game_logs[gameID]["type"] == "AI" and side == 1:
		return "AI"
	if active_game_logs[gameID]["type"] == "remote" and side == -1:
		return "player1"
	if active_game_logs[gameID]["type"] == "remote" and side == 1:
		return "player2"
	return "local"

def	get_player_alias(gameID):
	return [active_game_logs[gameID]["players"]["1"]["alias"], active_game_logs[gameID]["players"]["2"]["alias"]]