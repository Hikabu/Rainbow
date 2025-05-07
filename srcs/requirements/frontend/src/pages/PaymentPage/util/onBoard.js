//flow find provider-> connect to smart contract-> take public functions -> 
// -> connect to wallet to pay for runnig the function
import { ethers } from "ethers";
import { ref } from 'vue'
import contractABI from "../contract-abi.json";
export function onBoard() {
    const alchemyUrl = import.meta.env.VITE_API_URL
    const contractAddress = import.meta.env.VITE_ALCHEMY_KEY;

    const currentAccount = ref(null);
    const message = ref('');
    const contractResponse = ref('');
    //taking the node forn alchemy (can not read the data without a node connection so alchemy is a read ony provider )

    //class contracts to connect to smart contract 
    //abi content the description of the ocntract 
    //provider - read only access
    // const readContract = new ethers.Contract(contractAddress, contractABI, provider)
    const connectWallet = async() => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                currentAccount.value = accounts[0];
            } catch (error){
                console.error("Error connecting: ", error);
             }
        } else  {
                alert("Metamask not found!")
            };
    };

    const getContract = async() => {
        const provider = new ethers.JsonRpcProvider(alchemyUrl);
        const signer = await provider.getSigner();
        return new ethers.Contract(contractAddress, contractABI, signer);
    };

    const writeContract = async() => {
        try{
            const contract = await getContract();
            
        }
    }

    const loadCurrentMessage = async () => { //call publick method 
        return await getContract.message();
    };

    return {
        loadCurrentMessage,
        connectWallet,
        getContract,
    }
};
