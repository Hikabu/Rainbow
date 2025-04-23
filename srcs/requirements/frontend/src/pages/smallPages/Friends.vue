<template>
    <div class="profile container-fluid p-0">
        <div class="d-flex row-flex">
            <SideBar />
            <div class="about col-md-10 p-5 flex-grow-1 position-relative">
                <!-- avatars -->
                <div style="cursor: pointer;" @click="triggerFileInput" >
                    <img 
                        v-if="user?.avatar || user?.intra_avatar" 
                        :src="user.avatar || user?.intra_avatar" 
                        class="rounded-circle"
                        style="width: 210px; height: 210px; object-fit: cover;"
                    >
                    <div 
                        v-else 
                        class="rounded-circle bg-secondary position-absolute top-1 end-0"
                        style="width: 210px; height: 210px;"
                    ></div>
                </div>
                <input 
                    ref="fileInput"
                    type="file"
                    style="display: none;"
                    accept="image/*"
                    @change="handleFileUpload"
                >
                <h1 class="text-white mb-5">My Friends</h1>
                <div class="card ">
                    <div class="card-body">
                        <form class="d-flex gap-2" @submit.prevent>
                            <input 
                                v-model="searchQuery"
                                class="form-control mr-sm-2" 
                                type="search" 
                                placeholder="Search some frineds..." 
                                aria-label="Username" 
                                aria-describedby="basic-addon1"
                                name="search">
                            <button 
                            type="submit"
                                class="btn btn-outline-success"  
                                @click="searchFriends"
                            >
                                Search
                            </button>
                        </form>
                        <!-- search results -->
                        <div v-if="searchResult.length" class="mt-2">
                            <div class="list-gr">
                                <!-- item in itmes array -->
                                <button
                                    v-for="result in searchResult" 
                                    :key="result.id"
                                    class=" btn btn-outline-primary list-gr-item list-gr-item-action d-flex justify-content-between align-items-center"
                                    @click="addFriend(result.id)"
                                >
                                    {{ result.username || result.intraLogin }}
                                    <!-- <span class="badge bg-primary rounded-pill">Add</span> -->
                                </button>
                            </div>
                        </div>
                        <!-- Friends -->
                        <div class="mb-4 d-flex row-flex justify-content-between">
                            <h2 class="form-label">Friends</h2>
                            <ul v-if ="user?.friends.length" class="list-disc list-inside text-white">
                                <li v-for="friend in user.friends" :key="friend.id">
                                    {{ friend.username || friend?.intraLogin }} 
                                    <span v-if="friend.isOnline">(Online)</span>
                                    <span v-else>(Ofline)</span>
                                </li>
                            </ul>
                            <p v-else class="text-white">No friends yet.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted,ref, watch  } from 'vue'

import SideBar from '../../components/SideBar.vue';
//make same reactivity
const fileInput = ref(null)
const searchQuery = ref('') 
const searchResult = ref([])
const user = ref(null)

//add friend
const addFriend = async (friendId) => {
    try {
        const currentFriends = user.value.friends.map(friend => friend.id)
        //spread to append to array withput changing 
        const updateFriend = [...currentFriends, friendId]
        //updatePr
        await axios.patch('api/profiles/me/', { 
           friendsQueryset: updateFriend 
        }, {
            withCredentials: true
        })
        await profileData()

        searchResult.value = []
        searchQuery.value = ''
        alert('Frined catched successfully!')
    } catch(error) {
        console.error('Error ddinf friend', error)
        alert('Failed to add...')
    }
}

const searchFriends = async () => {
    if (!searchQuery.value.trim()) {
        searchResult.value = []
        return 
    }
    try {
        const response = await axios.get(`api/friends/search/?query=${encodeURIComponent(searchQuery.value)}`,{
            withCredentials: true
    })
        searchResult.value = response.data
    } catch (error){
        console.error('Error searchong friends', error)
        searchResult.value = []
    }
}

//debounce function
const debounce = (func, delay) => {
    let timeoutId //to cance previus timeouts 
    return (...args) => { // the return of the original function but it will be undefined untill time passed
        clearTimeout(timeoutId) //only the most recent event triggers passed func(timer keeping reset until user will calm down)
        timeoutId = setTimeout(() => {
            func.apply(this, args) //this===window  after timeout run from exacly the same env - from the same this
        }, delay)
    }
}

const triggerFileInput = () => {
    fileInput.value.click()
}

const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
        alert('Please upload an image file')
        return
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB')
        return
    }
    const formData = new FormData()
    formData.append('avatar', file)

    try {
        const response = await axios.patch('api/profiles/me/', formData, {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        })
        console.log("Upload response is:", response.data)
        // Update avatar URL with timestamp to prevent caching
        user.value.avatar = `${response.data.avatar}?${Date.now()}`
        alert('Avatar updated successfully!')
    } catch (error) {
        console.error('Error uploading avatar:', error)
        alert('Failed to update avatar')
    } finally {
        // Reset input to allow uploading same file again
        event.target.value = ''
    }
}

const profileData = async () => {
    try {
        const response = await axios.get('api/profiles/me/')
        user.value = response.data
        if (!user.value.displayName){
            if ((user.value.displayName = user.value.username) == null)
                user.value.displayName = user.value.intraLogin
            user.value.displayName = user.value.username
        }
        else
            return user.value.displayName
    } catch (error) {
        console.error('Error fetching profile:', error)
    }
}
const debouncedSearch = debounce(searchFriends, 300)
onMounted(() => {
    profileData()
})
watch(searchQuery, debouncedSearch) //if query changed calles debounce
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
.search {
    backdrop-filter: blur(70px);
}
.list-group-item {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.list-group-item:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>