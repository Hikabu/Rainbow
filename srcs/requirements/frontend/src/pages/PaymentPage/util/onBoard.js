//flow find provider-> connect to smart contract-> take public functions -> 
// -> connect to wallet to pay for runnig the function
// import { ethers } from "ethers";
import { ref } from 'vue'

import contractABI from "../contract-abi.json";
export function onBoard() {
    // const alchemyUrl = import.meta.env.VITE_API_URL;
    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
    let message = ref('');
    let contractResponse = ref('');
    let currentAccount = ref(null)
    //taking the node forn alchemy (can not read the data without a node connection so alchemy is a read ony provider )

    //class contracts to connect to smart contract 
    //abi content the description of the ocntract 
    //provider - read only access
    let signer = null;
    let provider;

    const connectWallet = async() => {
    if (window.ethereum == null) {
        alert("Metamask not found!")
        console.log("MetaMask not installed; using read-only defaults")
        provider = ethers.getDefaultProvider();
    } else  {
        provider = new ethers.BrowserProvider(window.ethereum)
        signer = await provider.getSigner();
        currentAccount.value = signer.address;
        console.log("provider is: ", provider);
        return currentAccount.value;
        };
    };
    const getContract = async() => {
        let signer = await provider.getSigner();
        return new ethers.Contract(contractAddress, contractABI, signer);
    };
    const writeContract = async() => {
        try{
            const contract = await getContract();
            console.log("what is in the contrsct", contract.interface.fragments.map(f => f.name));
            console.log("the contract is", contract)

            const tx = await contract.update(message.value)
            await tx.wait();
            alert("transaction successfull")
        } catch (error) {
            console.error("Write error", error);
        }
    }
    const readContract = async() => {
        try {
            //message is public tate variable - but solidity already creates the getter function 
            const contract = await getContract();
            const response = await contract.message();
            contractResponse.value = response; 
        } catch(error) {
            console.error("Read error", error);
        }
    }
    const loadCurrentMessage = async () => { //call publick method 
        return await getContract.message();
    };

    return {
        loadCurrentMessage,
        connectWallet,
        writeContract,
        readContract,
        message,
        currentAccount,
        contractResponse,
    }
};
