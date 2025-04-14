<!-- MainPage.vue -->
<template>
  <div class="mainpage container-fluid p-0">
    <div class="d-flex row-flex">
      <SideBar />
      <div class="about col-md-10 p-0 flex-grow-1 position-relative">
        <!-- A container DIV, not a canvas -->
        <div ref="threeContainer" class="three-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import SideBar from '../../components/SideBar.vue';
import { init } from '../../graphics/index.js'

const threeContainer = ref(null)

onMounted(async () => {
  await init(threeContainer.value) // This is a div now
})
</script>
