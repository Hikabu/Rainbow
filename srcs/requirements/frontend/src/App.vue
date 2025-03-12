<template>
  <ConfigProvider :theme="ANTD_THEME_CONFIG">
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
  min-height: 100vh;
}

</style>
