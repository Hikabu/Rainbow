
from web3 import Web3, AsyncWeb3

alchemy_node = "https://eth-sepolia.g.alchemy.com/v2/B8xrqqACeRvTrRKCE8mp4YhHw1MRM9Au"
web3 = Web3(Web3.HTTPProvider(alchemy_node))

print(web3.is_connected())