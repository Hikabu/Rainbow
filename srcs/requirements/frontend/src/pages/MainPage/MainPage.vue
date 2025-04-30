<template>
  <div class="background mainpage container-fluid p-0">

	<div v-if="isLoading" ></div>
    <div v-if="isLoading" id="loading-screen" :style="{ opacity: loadingOpacity }">
      <div>LOADING<span id="loading-dots"></span></div>
    </div>

    <div v-show="appVisible" class="d-flex row-flex" :style="{ opacity: appOpacity }">
      <SideBar />
      <div class="about col-md-10 p-0 flex-grow-1 position-relative">
        <div ref="threeContainer" class="three-container"></div>
      </div>
    </div>

  </div>
</template>



<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import SideBar from '../../components/SideBar.vue'
import { preEnterScene, exitScene } from '../../three.js/index.js'
import { OnLoad } from '../../three.js/mainScene/utils/OnLoad.js'

const threeContainer = ref(null)

const isLoading = ref(true);
const appVisible = ref(false);
const loadingOpacity = ref(1);
const appOpacity = ref(0);  

onMounted(async () => {
  console.log("on mount")
  if (threeContainer.value) {
	console.log("ok")
    await preEnterScene(threeContainer.value)
	new OnLoad().set_first_load(isLoading, appVisible, loadingOpacity, appOpacity)
  }
})

onBeforeUnmount(() => {
  exitScene()
})
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100%;
  position: absolute; /* or relative depending on layout */
  top: 0;
  left: 0;
  z-index: 0;
  font-family: 'Press Start 2P', sans-serif;
}
.background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: black;
  z-index: 0;
}

#loading-screen {
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background-color: rgba(0, 0, 0, 0.8);
			border: 2px solid #00ffcc;
			border-radius: 12px;
			color: #00ffcc;
			padding: 1.5rem 2.5rem;
			font-size: 1rem;
			text-align: center;
			box-shadow: 0 0 12px #00ffcc;
			z-index: 1000;
			pointer-events: none;
		}
		#loading-dots::after {
			content: '';
			display: inline-block;
			width: 1ch;
			text-align: left;
			animation: dots 1.5s steps(3, end) infinite;
		}
		@keyframes dots {
			0% { content: ''; }
			33% { content: '.'; }
			66% { content: '..'; }
			100% { content: '...'; }
		}
</style>
