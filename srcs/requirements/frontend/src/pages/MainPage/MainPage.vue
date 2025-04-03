<template>
    <div class="mainpage container-fluid p-0">
        <div class="d-flex row-flex">
            <SideBar />
                <div class="about col-md-10 p-5 flex-grow-1 position-relative">
                <!-- </div> -->

                <div class="profile">
                    <h1>MainPage</h1>
                    <p>Fridge is cool when you are in hell</p>
                </div>
            </div>
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

.about {
    min-height: 100vh;
    background: rgb(10,42,54);
    background: linear-gradient(90deg, rgba(10,42,54,1) 0%, rgba(150,0,0,1) 60%, rgba(120,71,0,1) 94%);

}
</style>