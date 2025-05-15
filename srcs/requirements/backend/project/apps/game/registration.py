
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
import os
import requests
from dotenv import load_dotenv
from web3 import Web3

from channels.layers import get_channel_layer
from project.apps.intrauth.models import GameResult, Profile
import logging
from django.views.decorators.csrf import csrf_exempt

load_dotenv()

PINATA_JWT_TOKEN = os.getenv('JWT_PINATA')
private_key = os.getenv('PRIVATE_KEY')
account_address = "0x0790248b39886759cA52dfCf44801E5AC0414c4f"

User = get_user_model()
logger = logging.getLogger(__name__)

logger.debug(f"the pinata jwt token is {PINATA_JWT_TOKEN }")
alchemy_node = "https://eth-sepolia.g.alchemy.com/v2/B8xrqqACeRvTrRKCE8mp4YhHw1MRM9Au"
web3 = Web3(Web3.HTTPProvider("https://eth-sepolia.g.alchemy.com/v2/B8xrqqACeRvTrRKCE8mp4YhHw1MRM9Au"))


abi = [
    {
        "inputs": [{"internalType": "string", "name": "_cid", "type": "string"}],
        "name": "addIpfsFileContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getIpfsFileContracts",
        "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "name": "ipfsFileContracts",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    }
]



logger.debug(f"the pinata jwt token is {abi}")
contract_address = web3.to_checksum_address('0xb6A59397b5C20cfc78963b7cAcab8eCc5284B164')
contract = web3.eth.contract(address=contract_address, abi=abi)



def upload_to_pinata(results, jwt_token):
    
	url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
	payload = {
		"pinataOptions": {"cidVersion": 1},
		"pinataMetadata": {"name": "pinnie.json"},
		"pinataContent": results
	}
	headers = {
		"Authorization": f"Bearer {jwt_token}",
		"Content-Type": "application/json"
	}
	response = requests.request("POST", url, json=payload, headers=headers)

	print(response.text)
	logger.debug(f"the response from pinata is {response.text}")
	if response.status_code == 200:
		response_data = response.json()
		ipfs_cid = response_data.get("IpfsHash")
		logger.debug(f"IPFS CID: {ipfs_cid}")
		return ipfs_cid
	else:
		logger.error(f"Failed to upload to Pinata: {response.text}")
		return None
 
 
def push_ipfs_to_contract(cid):
	transaction = contract.functions.addIpfsFileContract(cid).build_transaction({
	'from': account_address,
	'nonce': web3.eth.get_transaction_count(account_address),
	'gas': 2000000,
	'gasPrice': web3.to_wei('10', 'gwei'),
	'chainId': 11155111 
})

	signed_tx = web3.eth.account.sign_transaction(transaction, private_key)

	tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
	tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
	print("CID successfully pushed to contract:", tx_receipt.transactionHash.hex())


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
	logger.info(f"data: {data}")
	logger.info(f"userID in data new_game: {data.get("userID1")}, {data.get("userID2", None)}")
	log['players']['1'] = create_new_player(data, data.get('userID1'), data.get('alias1'))				
	log['players']['2'] = create_new_player(data, data.get('userID2', None), data.get('alias2'))
	logger.info("players: ")
	logger.info(f"{log['players']['1']}")
	logger.info(f"{log['players']['2']}")
	logger.info("")
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
	logger.debug("STORE GAME RESULTS")
	log = cache.get(f"game_log:{results['gameID']}")
	if log == None:
		return
	cache.delete(f"game_log:{results['gameID']}")
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
				"error" : results.get("error", ""),
				"date" : results["start_time"],
			})
 
	# logger.debug(f"the results are: {log}")


	game_id = results["gameID"]
	player1_data = log['players']['1']
	player2_data = log['players']['2']
	
	player1 = await sync_to_async(User.objects.get)(id=player1_data['id'])
	player2 = None
	if player2_data['id'] is not None:
		player2 = await sync_to_async(User.objects.get)(id=player2_data['id'])
	else:
		logger.debug(f"hey no player 2? {player2_data['id']}, also-> {player2_data}")
	logger.debug(f"player1: {player1}") 
	logger.debug(f"player2: {player2}")
	game_data = {
		"player1_id": player1_data['id'],
		"player2_id": player2_data['id'],
		"player1_score": player1_data['score'],
		"player2_score": player2_data['score'],
		"player1_result": player1_data['result'],
		"player2_result": player2_data['result'],
		"game_id": game_id,
		"timestamp": results["start_time"], 
	}
	logger.debug(f"the game_data is {game_data}")
	logger.debug(f"going to pinanta")
	ipfs_cid = upload_to_pinata(game_data, PINATA_JWT_TOKEN)
	logger.debug(f"what is in the response of pinia {ipfs_cid}")
	did = push_ipfs_to_contract(ipfs_cid)
	logger.debug(f"oh please should be success {did}")

 
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
	logger.debug(f"profile 1 status: {player1}, {player1_data['result']}")
	await profile_status(player1, player1_data['result'])
	if player2:
		logger.debug(f"profile 2 status: {player2}, {player2_data['result']}")
		await profile_status(player2, player2_data['result'])

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

def create_new_player(data, userID, alias):
	logger.debug(f"user recieved ? {userID}")
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

