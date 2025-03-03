<template>
  <ConfigProvider :theme="ANTD_THEME_CONFIG">
    <!--  <div class="no-cursor-overlay" :class="{ 'no-cursor-overlay_active': isCursorDisabled }" />-->
    <!-- <div class="grain-overlay" /> -->
    <!-- <LoginPage /> -->
    <main class="layout">
      <router-view />
  </main>
  </ConfigProvider>
</template>

<script setup>

</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

</style>
