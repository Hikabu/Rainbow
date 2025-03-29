<template>
    <div class="profile container-fluid p-0">
        <div class="d-flex row-flex">
            <SideBar />
            <div class="about col-md-10 p-5 flex-grow-1">
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

const user = ref(null)
const isEditing = ref(false)
const newDisplayName = ref('')

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
            withCredentials: true
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
.form-label {
    font-weight: bold;
}
</style>