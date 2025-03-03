<template>
  <div class="ball" :style="styles">
    <div
      class="ball__container"
      :style="{
        backgroundImage: `url(${ballImage})`,
      }"
    />
  </div>
</template>

<script setup>
import ballImage from 'assets/ball.png';
import { computed, defineProps, onMounted, onUnmounted, ref } from 'vue';

const { width, height, position } = defineProps({
  width: { type: Number, default: 100 },
  height: { type: Number, default: 100 },
  position: {
    type: Object,
    required: true,
    validator: (value) => {
      return typeof value.x === 'number' && typeof value.y === 'number';
    },
  },
});

const ballPosition = ref({ x: position?.x, y: position?.y });
let animationFrameId = null;

const styles = computed(() => ({
  width: `${width}%`,
  height: `${height}%`,
  top: `${ballPosition.value.y}%`,
  left: `${ballPosition.value.x}%`,
}));

const update = () => {
  ballPosition.value.x = position?.x;
  ballPosition.value.y = position?.y;
  animationFrameId = requestAnimationFrame(update);
};

onMounted(() => {
  animationFrameId = requestAnimationFrame(update);
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0);
    background-position: 0 0;
  }

  to {
    transform: rotate(360deg);
    background-position: 200% 100%;
  }
}

.ball {
  position: absolute;
  z-index: 1;
  transform: translate(-50%, -50%);
}

.ball__container {
  width: 100%;
  height: 100%;

  background-color: white;
  background-repeat: repeat-x;
  background-size: 200% 100%;
  border-radius: 50%;

  animation: spin 1s linear infinite;
}
</style>
