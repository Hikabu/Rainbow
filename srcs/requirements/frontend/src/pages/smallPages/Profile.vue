<template>
    <div class="profile">
        <div class="sidebar">
            <SideBar />
        </div>

        <div class="about">
            <h1>profile</h1>
            <p>Here ypu can write some bullshit</p>
        </div>
        
    </div>
    
</template>
<script setup>
import SideBar from '../../components/SideBar.vue';
</script>

<style scoped>
.sidebar {
	display: flex; 
	/* flex-direction: column; */
}
.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.profile {
    flex: 1 1 0;
}
</style>