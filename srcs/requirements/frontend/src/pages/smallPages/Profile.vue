<template>
    <div class="profile container-fluid p-0">
        <div class="d-flex row-flex">
            <SideBar />
            <div class="about col-md-10 p-5 flex-grow-1 position-relative">
                <!-- avatars -->
                <div style="cursor: pointer;" @click="triggerFileInput" >
                    <img 
                        v-if="user?.avatar" 
                        :src="user.avatar" 
                        class="rounded-circle"
                        style="width: 110px; height: 110px; object-fit: cover;"
                    >
                    <div 
                        v-else 
                        class="rounded-circle bg-secondary position-absolute top-1 end-0"
                        style="width: 110px; height: 110px;"
                    ></div>
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
                        <div class="mb-4">
                            <label class="form-label ">Display Name</label>
                            <div class="input-group ">
                                <input 
                                    v-if="isEditing"
                                    v-model="newDisplayName" 
                                    class="form-control"
                                >
                                <div v-else class="form-control-plaintext">
                                    <!-- <label> kaka</label> -->
                                    {{ user?.username }}
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
                        </div>

                        <!-- Email -->
                        <div class="mb-4">
                            <label class="form-label">Email</label>
                            <div class="form-control-plaintext text-white">
                                <label> kaka@gmail.com</label>
                                <!-- {{ user?.email }} -->
                            </div>
                        </div>

                        <!-- Wins and Losses -->
                        <div class="row">
                            <div class="col-md-6 mb-4 ">
                                <label class="form-label ">Wins</label>
                                <div class="form-control-plaintext text-white">
                                    <!-- {{ user?.wins || 0 }} -->
                                    <label>5</label>
                                </div>
                            </div>
                            <div class="col-md-6 mb-4">
                                <label class="form-label">Losses</label>
                                <div class="form-control-plaintext text-white ">
                                    <!-- {{ user?.losses || 0 }} -->
                                    <label> 8</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted,ref } from 'vue'

import SideBar from '../../components/SideBar.vue';

const fileInput = ref(null)

const triggerFileInput = () => {
    fileInput.value.click()
}

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
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('File size should be less than 2MB')
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
        if (!user.value.displayName)
            newDisplayName.value = user.value.username
        newDisplayName.value = user.value.displayName
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