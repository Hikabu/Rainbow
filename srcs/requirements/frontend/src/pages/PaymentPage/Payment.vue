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
                  <button class="btn btn-outline-info" @click="connect">
                    {{ currentAccount ? 'Wallet connected' : 'Connect wallet' }}
                  </button>
                  <div v-if="currentAccount">
                    <p>Connected account: {{ currentAccount }}</p>
                    <input v-model="message" placeholder="amount"/>
                    <button @click="writeContract">Sent to contract</button>
                    <button @click="readContract">Read from contract</button>
                    <p>Paid amount: {{ contractResponse }}</p>
                  </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted} from 'vue'

import SideBar from '../../components/SideBar.vue';
import { fetchProfile,user } from '../../stores/users'
import { onBoard } from './util/onBoard';
//make same reactivity
const { connectWallet, readContract, writeContract, currentAccount, message, contractResponse, } = onBoard()


const connect = async () => {
    const connected = await connectWallet();
    console.log("Connected wallets:", connected);
}

// const disconnect = async () => {
//     if (wallets.value.length) {
//         await disconnectWallet({ label: wallets.value[0].label})
//     }
// }
onMounted(async () => {
    await fetchProfile()
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