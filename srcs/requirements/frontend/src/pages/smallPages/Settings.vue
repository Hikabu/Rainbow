<template>
    <div class="settings">
        <div class="sidebar">
            <SideBar />
        </div>

        <div class="setup">
            <h1>settings</h1>
            <p>Set up your shit</p>
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
.setup {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.settings {
    flex: 1 1 0;
}
</style>