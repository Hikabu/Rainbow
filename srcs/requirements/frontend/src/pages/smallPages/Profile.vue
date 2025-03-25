<template>
    <div class="profile">
        <div class="sidebar">
            <SideBar />
        </div>

        <div class="about">
            <h1>My details</h1>
            <span class="fieldName">display name</span>
            <p>user: {{ user?.username }} </p>
            <span class="input"><input v-model="message" placeholder="change me"></span>
            <!-- <span class="fieldName">email</span> -->
            <p>Email {{ user?.email }} </p>
            <!-- <span class="input"><input v-model="message" placeholder="just your email"></span> -->
            <span class="fieldName">friends</span>
            <span class="input"><input v-model="message" placeholder="not changable"></span>
            <span class="fieldName">win</span>
            <span class="input"><input v-model="message" placeholder="from database"></span>
            <span class="fieldName">lose</span>
            <span class="input"><input v-model="message" placeholder="from database"></span>
        </div>
        
    </div>
    
</template>
<script setup>
import axios from 'axios'
import { onMounted,ref } from 'vue'

import SideBar from '../../components/SideBar.vue';


const user = ref(null)
const profileData = async () => {
    try {
        const response = await axios.get('api/profiles/me/', {
            withCredentials: true
        })
        user.value = response.data
        console.log("user value is:", user.value);
    } catch (error) {
        console.error('error happends', error);
    }
}
onMounted(() => {
    profileData()
})
</script>

<style lang="scss" scoped>
.sidebar {
	display: flex; 
	/* flex-direction: column; */
}
.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
//   position: ;
}

.profile {
    flex: 1 1 0;
}
</style>