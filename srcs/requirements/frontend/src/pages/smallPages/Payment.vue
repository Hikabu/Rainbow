<template>
    <div class="profile container-fluid p-0">
        <div class="d-flex row-flex">
            <SideBar />
            <div class="about col-md-10 p-5 flex-grow-1 position-relative">
                <!-- avatars -->
                <div style="cursor: pointer;">
                    <img 
                        v-if="user?.avatar || user?.intra_avatar" 
                        :src="user.avatar || user?.intra_avatar" 
                        class="rounded-circle"
                        style="width: 210px; height: 210px; object-fit: cover;"
                    >
                </div>
                    <button 
                        class="btn btn-outline-info"
                        @click="connect"
                    >
                    Connect to a Wallet</button>
                    <button 
                        v-if="wallets.length" 
                        class="btn btn-outline-warning m-4"
                        @click="disconnect">Disconnect last Wallet</button>
                    <div v-if="wallets.length">
                        <div class="text-white m-5">
                            <div v-for="wallet in wallets" :key="wallet.label">  
                                <p>{{ wallet.label }}:</p>
                                <ul>
                                    <li v-for="account in wallet.accounts" :key="account.address">
                                        {{ account.address }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useOnboard } from '@web3-onboard/vue';
import axios from 'axios'
import { onMounted,ref} from 'vue'
import { user, fetchProfile } from '../../stores/users'

import SideBar from '../../components/SideBar.vue';
//make same reactivity
// const user = ref(null)
const { connectWallet, wallets, disconnectWallet } = useOnboard()

const connect = async () => {
    const connected = await connectWallet();
    console.log("Connected wallets:", connected);
}

const disconnect = async () => {
    if (wallets.value.length) {
        await disconnectWallet({ label: wallets.value[0].label})
    }
}

// const profileData = async () => {
//     try {
//         const response = await axios.get('api/profiles/me/')
//         user.value = response.data
//         user.value.displayName ||= user.value.username ?? user.value.intraLogin

//         if (user.friends && Array.isArray(user.friends)){
//             user.friends = user.friends.map(f => ref(f) )
//         }
//         return user.value.displayName
//     } catch (error) {
//         console.error('Error fetching profile:', error)
//     }
// }
onMounted(async () => {
    await fetchProfile()
    // profileData()
})
</script>

<style scoped>
.card {
    max-width: 700px;
    background-color: hsla(0, 0%, 100%, .01);
    border: 2px solid hsla(0, 0%, 100%, .7);
    padding: var(--big-space) var(--regular-space);
    color: var(--light); 
    border-radius: var(--regular-space);
    backdrop-filter: blur(70px);
    padding-block: var(--regular-space);

}
.about {
    min-height: 100vh;
    background: rgb(10,42,54);
    background: linear-gradient(90deg, rgba(10,42,54,1) 0%, rgba(150,0,0,1) 60%, rgba(120,71,0,1) 94%);

}
</style>