<template>
    <div class="mainpage">
        <div class="sidebar">
            <SideBar />
        </div>

        <div class="profile">
            <h1>MainPage</h1>
            <p>Fridge is cool when you are in hell</p>
        </div>
        
    </div>
    
</template>

<script setup>
import SideBar from '../../components/SideBar.vue';
</script>

<style scoped>
.sidebar {
	display: flex; 
}
.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.mainpage {
    flex: 1 1 0;
}
</style>