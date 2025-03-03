<template>
  <slot />
</template>

<script setup>
import { defineProps, onMounted, onUnmounted } from 'vue';

const { socket, side, controls } = defineProps({
  socket: {
    type: WebSocket,
    required: true,
  },
  side: {
    type: String,
    required: true,
    validator: (value) => ['left', 'right'].includes(value),
  },
  controls: {
    type: Object,
    required: true,
    validator: (value) => typeof value.up === 'string' && typeof value.down === 'string',
  },
});

let direction = 0;

const handleKeyDown = (event) => {
  if (event.key === controls?.up) {
    direction = -1;
  } else if (event.key === controls?.down) {
    direction = 1;
  }
  sendDirection();
};

const handleKeyUp = (event) => {
  if (event.key === controls?.up || event.key === controls?.down) {
    direction = 0;
  }
  sendDirection();
};

// Send paddle direction to backend
const sendDirection = () => {
  console.log('sending direction....');
  if (socket.readyState === WebSocket.OPEN) {
    try {
      socket.send(
        JSON.stringify({
          type: 'paddle',
          side,
          direction: direction,
        })
      );
    } catch (error) {
      console.error('❌ Error sending paddle direction:', error);
    }
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});
</script>
