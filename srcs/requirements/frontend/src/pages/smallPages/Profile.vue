<template>
    <div class="profile container-fluid p-0">
        <div class="d-flex row-flex">
            <SideBar />
            <div class="about col-md-10 p-5 flex-grow-1 position-relative">
                <!-- avatars -->
                <!-- <div v-if="user"> -->
                    <div style="cursor: pointer;" @click="triggerFileInput" >
                        <img 
                            v-if="user?.avatar || user?.intra_avatar" 
                            :src="user.avatar || user?.intra_avatar" 
                            class="rounded-circle"
                            style="width: 210px; height: 210px; object-fit: cover;"
                        >
                    </div>
                    <input 
                        ref="fileInput"
                        type="file"
                        style="display: none;"
                        accept="image/*"
                        @change="handleFileUpload"
                    >
                    <h1 class="text-white mb-5">My Details</h1>
                    
                    <div class="card ">
                        <div class="card-body ">
                            <!-- Display Name Section -->
                            <div class="mb-4 d-flex row-flex justify-content-between">
                            <label >Display Name</label>
                                    <input 
                                        v-if="isEditing"
                                        v-model="newDisplayName" 
                                    >
                                    <div v-else class=" text-white">
                                        {{ user?.displayName }}
                                    </div>
                                    <button 
                                        class="btn btn-outline-primary"
                                        @click="toggleEdit"
                                    >
                                        {{ isEditing ? 'Cancel' : 'Edit' }}
                                    </button>
                                    <button 
                                        v-if="isEditing"
                                        class="btn btn-primary"
                                        @click="saveDisplayName"
                                    >
                                        Save
                                    </button>
                            </div>

                            <!-- Email -->
                            <div class="mb-4 d-flex row-flex justify-content-between">
                                <label >Email</label>
                                <div class="text-white">
                                    {{ user?.email }}
                                </div>
                            </div>
                            <!-- Username -->
                            <div class="mb-4 d-flex row-flex justify-content-between">
                                <label >Friends can find you by </label>
                                <div class="text-white">
                                    {{ user?.username || user?.intraLogin }}
                                </div>
                            </div>
                        </div>
                        <!-- Friends -->
                        <div class="mb-4 d-flex row-flex justify-content-between">
                            <label class="form-label">Friends</label>
                            <ul v-if ="user?.friends.length" class="list-disc list-inside text-white">
                                <li v-for="friend in user.friends" :key="friend.id">
                                    {{ friend.username || friend?.intraLogin }} 
                                    <span v-if="friend.isOnline">(Online)</span>
                                    <span v-else>(Offline)</span>
                                </li>
                            </ul>
                            <p v-else class="text-white">No friends yet.</p>
                        </div>

                            <!-- Wins and Losses -->
                            <div class="row">
                                <div class="col-md-6 mb-4 ">
                                    <label class="form-label ">Wins</label>
                                    <div class="form-control-plaintext text-white">
                                        {{ user?.wins || 0 }}
                                    </div>
                                </div>
                                <div class="col-md-6 mb-4">
                                    <label class="form-label">Losses</label>
                                    <div class="form-control-plaintext text-white ">
                                        {{ user?.losses || 0 }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                <!-- </div> -->
                <!-- <div v-else> Loading...</div> -->
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted,ref } from 'vue'

import SideBar from '../../components/SideBar.vue';
// import { user } from '../../stores/users'

const fileInput = ref(null)

const triggerFileInput = () => {
    fileInput.value.click()
}
//User connects --> Add user to active_users --> Send updated active_users to frontend
//User disconnects --> Remove user from active_users --> Send updated active_users to frontend
//Frontend receives active_users list --> Display online users

const user = ref(null)
const isEditing = ref(false)
const newDisplayName = ref('')

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
        user.value.displayName ||= user.value.username ?? user.value.intraLogin

        if (user.friends && Array.isArray(user.friends)){
            user.friends = user.friends.map(f => ref(f) )
        }
        return user.value.displayName
    } catch (error) {
        console.error('Error fetching profile:', error)
    }
}

const toggleEdit = () => {
    isEditing.value = !isEditing.value
    if (!isEditing.value) {
        newDisplayName.value = user.value.username
    }
}

const saveDisplayName = async () => {
    try {
        const response = await axios.patch('api/profiles/me/', {
            displayName: newDisplayName.value});
        console.log(response)
        // user.value.displayName = newDisplayName.value
        user.value = response.data
        isEditing.value = false
        alert('Display name updated successfully!')
    } catch (error) {
        console.error('Error updating display name:', error)
        alert('Failed to update display name')
    }
}

onMounted(() => {
    profileData()
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