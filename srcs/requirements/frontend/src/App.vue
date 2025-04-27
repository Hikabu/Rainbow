<template>
    <main class="layout">
      <router-view />
    </main>
</template>

<script setup>
import 'bootstrap/dist/css/bootstrap.css';

</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

</style>
