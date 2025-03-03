<template>
  <div class="game">
    <div ref="containerRef" class="game__container">
      <div class="game__void-boundary">
        <div class="game__void-boundary-shadow game__void-boundary-shadow_left" />
        <div class="game__void-boundary-shadow game__void-boundary-shadow_top" />
        <div class="game__void-boundary-shadow game__void-boundary-shadow_right" />
        <div class="game__void-boundary-shadow game__void-boundary-shadow_bottom" />
      </div>
      <Ball :width="ballWidth" :height="ballHeight" :position="ballPosition" />
      <withPlayerControl :socket="socket" :side="'left'" :controls="{ up: 'w', down: 's' }">
        <Paddle :side="'left'" :position="leftPaddlePosition" />
      </withPlayerControl>
      <!--      <withPlayerControl-->
      <!--        :socket="socket"-->
      <!--        :side="'right'"-->
      <!--        :controls="{ up: 'ArrowUp', down: 'ArrowDown' }"-->
      <!--      >-->
      <!--        <Paddle :side="'right'" :position="rightPaddlePosition" />-->
      <!--      </withPlayerControl>-->
      <!--      <withAiControl-->
      <!--        :socket="socket"-->
      <!--        :side="'left'"-->
      <!--        :ball-position="ballPosition"-->
      <!--        :ball-velocity="ballVelocity"-->
      <!--        :paddle-position="leftPaddlePosition"-->
      <!--        :paddle-width="paddleWidth"-->
      <!--      >-->
      <!--        <Paddle :side="'left'" :position="leftPaddlePosition" />-->
      <!--      </withAiControl>-->
      <withAiControl
        :socket="socket"
        :side="'right'"
        :ball-position="ballPosition"
        :ball-velocity="ballVelocity"
        :paddle-position="rightPaddlePosition"
        :paddle-width="paddleWidth"
      >
        <Paddle :side="'right'" :position="rightPaddlePosition" />
      </withAiControl>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, onUpdated, ref, watch } from 'vue';

import { Ball, Paddle, withAiControl, withPlayerControl } from './components';
import { BALL_HEIGHT, BALL_WIDTH } from './components/Ball/config/constants.js';
import { PADDLE_HEIGHT, PADDLE_WIDTH } from './components/Paddle/config/constants.js';

// Dimensions
const containerRef = ref(null);
const containerWidth = ref(0);
const containerHeight = ref(0);
const ballWidth = ref(0);
const ballHeight = ref(0);
const paddleWidth = ref(0);
const paddleHeight = ref(0);

// Socket connection
const socketMessage = ref('');
let socket = null;

// Game state
const ballPosition = ref({ x: 50, y: 50 });
const ballVelocity = ref({ x: 0, y: 0 });
const ballUpdateDelay = ref(0);
const leftPaddlePosition = ref({ y: 50 });
const rightPaddlePosition = ref({ y: 50 });

const updateContainerDimensions = () => {
  // noinspection JSUnresolvedReference
  if (containerRef?.value) {
    containerWidth.value = containerRef.value.offsetWidth;
    containerHeight.value = containerRef.value.offsetHeight;
  }
};

const calculateBallSize = () => {
  if (containerWidth.value && containerHeight.value) {
    ballWidth.value = parseFloat(((BALL_WIDTH / containerWidth.value) * 100).toFixed(2));
    ballHeight.value = parseFloat(((BALL_HEIGHT / containerHeight.value) * 100).toFixed(2));
  }
};

const calculatePaddleSizeInPercentages = () => {
  if (containerWidth.value && containerHeight.value) {
    paddleWidth.value = parseFloat(((PADDLE_WIDTH / containerWidth.value) * 100).toFixed(2));
    paddleHeight.value = parseFloat(((PADDLE_HEIGHT / containerHeight.value) * 100).toFixed(2));
  }
};

const initializeWebSocketInPercentages = () => {
  const socketUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/pong/';
  socket = new WebSocket(socketUrl);
  console.log('socket', socket);

  socket.onopen = () => {
    console.log('✅ WebSocket connected');
    console.log(`ballWidth: ${ballWidth.value}, ballHeight: ${ballHeight.value}`);
    console.log(`paddleWidth: ${paddleWidth.value}, paddleHeight: ${paddleHeight.value}`);

    if (isNaN(ballWidth.value) || isNaN(ballHeight.value)) {
      console.error('Invalid width or height values:', ballWidth.value, ballHeight.value);
      return;
    }

    // Check if the WebSocket is open (readyState === 1)
    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(
          JSON.stringify({
            type: 'init',
            ballWidth: ballWidth.value,
            ballHeight: ballHeight.value,
            paddleWidth: paddleWidth.value,
            paddleHeight: paddleHeight.value,
          })
        );
      } catch (error) {
        console.error('Error sending data:', error);
      }
    } else {
      console.error('WebSocket is not open yet');
    }
  };

  socket.onmessage = (event) => {
    // console.log('📨 Message from server:', event.data);
    const data = JSON.parse(event.data);
    const { ball, paddles } = data || {};

    socketMessage.value = data;

    if (ball) {
      const { position = 50, velocity = 5, delay = 1.6 } = ball || {};
      ballPosition.value = position;
      ballVelocity.value = velocity;
      ballUpdateDelay.value = parseFloat(delay.toFixed(2));
    }

    if (paddles) {
      const { left = { y: 50 }, right = { y: 50 } } = paddles || {};
      leftPaddlePosition.value = left;
      rightPaddlePosition.value = right;
    }
  };

  socket.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
  };

  socket.onclose = (event) => {
    console.info('🔌 WebSocket disconnected:', event.reason);
  };
};

const closeWebSocket = () => {
  if (socket) {
    socket.close();
    console.info('🔌 WebSocket connection closed');
  }
};

watch([containerWidth, containerHeight], calculateBallSize, {
  immediate: true,
});

watch([containerWidth, containerHeight], calculatePaddleSizeInPercentages, {
  immediate: true,
});

onMounted(() => {
  updateContainerDimensions();
  initializeWebSocketInPercentages();
  window.addEventListener('resize', updateContainerDimensions);
});

onUpdated(() => {
  updateContainerDimensions();
});

onUnmounted(() => {
  closeWebSocket();
  window.removeEventListener('resize', updateContainerDimensions);
});
</script>

<style scoped>
.game {
  overflow: hidden;

  box-sizing: border-box;
  width: 100%;
  max-width: 800px;
  height: 100%;
  max-height: 600px;

  border-top: 2px solid white;
  border-bottom: 2px solid white;
}

.game__container {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px;
}

.game__void-boundary {
  position: absolute;
  top: 0;
  left: 0;

  display: flex;
  justify-content: space-between;

  width: 100%;
  height: 100%;
}

.game__void-boundary-shadow {
  position: absolute;
  z-index: 2;
  width: 7%;
  height: 100%;
}

.game__void-boundary-shadow_left {
  left: 0;
  background: linear-gradient(to right, black, transparent);
}

.game__void-boundary-shadow_top {
  top: 0;
  width: 100%;
  height: 15%;
  background: linear-gradient(to bottom, rgb(0 0 0 / 0.5), transparent);
}

.game__void-boundary-shadow_right {
  right: 0;
  background: linear-gradient(to left, black, transparent);
}

.game__void-boundary-shadow_bottom {
  bottom: 0;
  width: 100%;
  height: 15%;
  background: linear-gradient(to top, rgb(0 0 0 / 0.5), transparent);
}
</style>
