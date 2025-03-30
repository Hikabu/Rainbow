<template>
    <div class="profile container-fluid p-0">
        <div class="d-flex row-flex">
            <SideBar />
            <div class="about col-md-10 p-5 flex-grow-1 position-relative">
                <!-- avatars -->
                <!-- Add click handler and file input -->
                <div style="cursor: pointer;" @click="triggerFileInput" >
                    <img 
                        v-if="user?.avatar" 
                        :src="user.avatar" 
                        class="rounded-circle"
                        style="width: 50px; height: 50px; object-fit: cover;"
                    >
                    <div 
                        v-else 
                        class="rounded-circle bg-secondary"
                        style="width: 50px; height: 50px;"
                    ></div>
                </div>
                <input 
                    ref="fileInput"
                    type="file"
                    style="display: none;"
                    accept="image/*"
                    @change="handleFileUpload"
                >
                <h1 class="mb-4">My Details</h1>
                
                <div class="card">
                    <div class="card-body">
                        <!-- Display Name Section -->
                        <div class="mb-4">
                            <label class="form-label">Display Name</label>
                            <div class="input-group">
                                <input 
                                    v-if="isEditing"
                                    v-model="newDisplayName" 
                                    class="form-control"
                                >
                                <div v-else class="form-control-plaintext">
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
                            <div class="form-control-plaintext">
                                {{ user?.email }}
                            </div>
                        </div>

                        <!-- Wins and Losses -->
                        <div class="row">
                            <div class="col-md-6 mb-4">
                                <label class="form-label">Wins</label>
                                <div class="form-control-plaintext">
                                    {{ user?.wins || 0 }}
                                </div>
                            </div>
                            <div class="col-md-6 mb-4">
                                <label class="form-label">Losses</label>
                                <div class="form-control-plaintext">
                                    {{ user?.losses || 0 }}
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
axios.defaults.xsrfCookieName = 'csrftoken'; // Django's default CSRF cookie name
axios.defaults.xsrfHeaderName = 'X-CSRFToken'; // Header name for CSRF token

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
        const response = await axios.get('api/profiles/me/', {
            withCredentials: true
        })
        user.value = response.data
        newDisplayName.value = user.value.username
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
            username: newDisplayName.value
        }, {
            withCredentials: true,
        })
        console.log(response)
        user.value.username = newDisplayName.value
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
    max-width: 600px;
    margin: 0 auto;
}
.about {
    min-height: 100vh;
}
</style>