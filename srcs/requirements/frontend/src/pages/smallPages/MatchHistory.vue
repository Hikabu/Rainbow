<template>
    <div class="profile container-fluid p-0">
        <div class="d-flex row-flex">
            <SideBar />
            <div class="about col-md-10 p-5 flex-grow-1 position-relative">
                <!-- avatars -->
                <div style="cursor: pointer;">
                    <img 
                        :src="user.avatar || user?.intra_avatar || logout" 
                        class="rounded-circle"
                        style="width: 210px; height: 210px; object-fit: cover;"
                    >
                </div>
                    <h1 class="text-white mb-5">Statistics</h1>
                        <!-- Wins and Losses -->
                        <div class="row">
                            <div class="col-md-6 mb-4 ">
                                <label class="form-label text-white">Wins</label>
                                <div class="form-control-plaintext text-white">
                                    {{ user?.wins || 0 }}
                                </div>
                            </div>
                        <div class="col-md-6 mb-4">
                            <label class="form-label text-white">Losses</label>
                            <div class="form-control-plaintext text-white ">
                                {{ user?.losses || 0 }}
                            </div>
                        </div>
                    </div>
                    <h1 class="text-white mb-5">My History</h1>
                    <!-- <div v-if="results?.lenght > 0"> -->
                        <div 
                          v-for="(game, index) in results"
                          :key="index"
                          class = "row mb-4 p-3 border rounded text-white"
                        >
                        <div class="col mb-4">
                            <strong>Game identificator is:</strong> {{ game.game_id }}
                        </div>
                        <div class="col mb-4">
                            <strong>The type of the game was:</strong> {{ game.game_type }}
                        </div>
                        <div class="col mb-4">
                            <strong>The game was at:</strong> {{ new Date(game.start_time).toLocaleString() }}
                        </div>
                        <div class="col mb-4">
                            <strong>Your score is:</strong> 
                            {{ game.user=== user.username ? game.user_score : game.player2_score }}
                        </div>
                        <div class="col mb-4">
                            <strong>Opponent's score:</strong> 
                            {{ game.user === user.username ? game.player2_score : game.user_score }}
                        </div>
                    </div>
                <!-- </div> -->
              <!-- <div v-else class="text-white">No game was found</div> -->
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted,ref } from 'vue'

import logout from '../../assets/logout.png';
import SideBar from '../../components/SideBar.vue';
import { fetchProfile, user } from '../../stores/users'

const results = ref(null)
//User connects --> Add user to active_users --> Send updated active_users to frontend
//User disconnects --> Remove user from active_users --> Send updated active_users to frontend
//Frontend receives active_users list --> Display online users

// const user = ref(null)
const gameResults = async() => {
    try{
        const response = await axios.get('api/results/result/')
        results.value = response.data
        return results.value
    }
    catch (error) {
        console.error('You did not played, so no results: ', error)
    }
}
onMounted(async () => {
    await gameResults(),
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