<template>
  <div class="mainpage container-fluid p-0">
    <div class="d-flex row-flex">
      <SideBar />
      <div class="about col-md-10 p-0 flex-grow-1 position-relative">
        <!-- 3D container mount point -->
        <div ref="threeContainer" class="three-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

import SideBar from '../../components/SideBar.vue'
import { enterScene, exitScene } from '../../three.js/index.js'

const threeContainer = ref(null)

onMounted(() => {
  if (threeContainer.value) {
    enterScene(threeContainer.value)
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
}
</style>
