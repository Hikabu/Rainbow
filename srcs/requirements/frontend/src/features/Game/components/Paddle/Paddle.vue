<template>
  <div
    class="paddle"
    :class="{
      paddle_side_left: side === 'left',
      paddle_side_right: side === 'right',
    }"
    :style="styles"
  />
</template>

<script setup>
import { computed, defineProps, onMounted, onUnmounted, ref } from 'vue';

import { PADDLE_HEIGHT, PADDLE_WIDTH } from './config/constants.js';

const { side, position } = defineProps({
  side: {
    type: String,
    required: true,
    validator: (value) => ['left', 'right'].includes(value),
  },
  position: {
    type: Object,
    required: true,
    validator: (value) => typeof value.y === 'number',
  },
});

const paddlePosition = ref({ x: position?.x, y: position?.y });
let animationFrameId = null;

const styles = computed(() => ({
  width: `${PADDLE_WIDTH}px`,
  height: `${PADDLE_HEIGHT}px`,
  top: `${paddlePosition.value.y}%`,
  left: `${paddlePosition.value.x}%`,
}));

const update = () => {
  paddlePosition.value.x = position?.x;
  paddlePosition.value.y = position?.y;
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
.paddle {
  position: absolute;
  z-index: 3;
  transform: translateY(-50%);

  background-color: white;
  border-radius: 2px;
}

.paddle_side_left {
  left: 0;
}

.paddle_side_right {
  right: 0;
}
</style>
