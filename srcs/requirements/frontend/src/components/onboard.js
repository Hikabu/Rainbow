import injectedModule from '@web3-onboard/injected-wallets'
import { init } from '@web3-onboard/vue'

import logo from '../assets/icon.png'

const injected = injectedModule()
const alchemyKey = import.meta.env.VITE_ALCHEMY_KEY;
const rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`

const web3Onboard = init({
  wallets: [injected], // all wallets which can see
  chains: [ 
    {
      id: '0xaa36a7',
      token: 'ETH',
      label: 'Sepolia testnet',
      rpcUrl //gateway to the node
    }
  ],
  appMetadata: {
    name: 'Transendence',
    icon: logo, 
    description: "Connect wallet"
  }
})

export default web3Onboard