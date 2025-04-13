<template>
    <div class="mainpage container-fluid p-0">
        <div class="d-flex row-flex">
            <SideBar />
      		<div class="about col-md-10 p-0 flex-grow-1 position-relative">
                <!-- Three.js-->
				<canvas ref="threeCanvas" class="three-canvas"></canvas>
      		</div>
         </div>
    </div>    
</template>

<script setup>
import { onMounted, ref } from 'vue'
import SideBar from '../../components/SideBar.vue';
import initThreeScene from '../../graphics/mainScene.js'

const threeCanvas = ref(null)
onMounted(() => {
  initThreeScene(threeCanvas.value)
})

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

.three-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>