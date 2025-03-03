<template>
  <slot />
</template>

<script setup>
import { defineProps, onMounted, onUnmounted, watch } from 'vue';

import { MOVEMENT_WINDOW, PREDICTION_INTERVAL } from './config/constants.js';

const { socket, side, ballPosition, ballVelocity, paddlePosition, paddleWidth } = defineProps({
  socket: {
    type: WebSocket,
    required: true,
  },
  side: {
    type: String,
    required: true,
    validator: (value) => ['left', 'right'].includes(value),
  },
  ballPosition: {
    type: Object,
    required: true,
    validator: (value) => typeof value.x === 'number' && typeof value.y === 'number',
  },
  ballVelocity: {
    type: Object,
    required: true,
    validator: (value) => typeof value.x === 'number' && typeof value.y === 'number',
  },
  paddlePosition: {
    type: Object,
    required: true,
    validator: (value) => typeof value.y === 'number',
  },
  paddleWidth: {
    type: Number,
    required: true,
  },
});

const EARLY_STOP_THRESHOLD = 3;

let aiPredictionIntervalId = null;
let aiMovementFrameId = null;
let predictedY = paddlePosition.y;
let lastDirection = 0;

// Send direction to the server
const sendDirection = (direction) => {
  if (socket.readyState === WebSocket.OPEN) {
    try {
      socket.send(
        JSON.stringify({
          type: 'paddle',
          side,
          direction,
        })
      );
    } catch (error) {
      console.error('❌ Error sending paddle direction:', error);
    }
  }
};

const predictBallYAtPaddle = () => {
  const paddleX = side === 'left' ? 0 : 100;
  const ballDirectionX = ballVelocity?.x > 0 ? 'right' : 'left';

  // Reset to center if ball is moving away
  if (
    (side === 'left' && ballDirectionX !== 'left') ||
    (side === 'right' && ballDirectionX !== 'right')
  ) {
    return 50;
  }

  // Calculate time until the ball reaches the paddle's x-axis
  const distanceToPaddleX = Math.abs(ballPosition?.x - paddleX);
  const timeToPaddle = distanceToPaddleX / Math.abs(ballVelocity?.x);
  let predictedY = ballPosition?.y + ballVelocity?.y * timeToPaddle;

  // Handle bouncing off top and bottom boundaries
  while (predictedY < 0 || predictedY > 100) {
    if (predictedY < 0) {
      predictedY = -predictedY;
    } else if (predictedY > 100) {
      predictedY = 200 - predictedY;
    }
  }

  // Adjust prediction with a paddle width
  predictedY = Math.min(100 - paddleWidth / 2, Math.max(paddleWidth / 2, Math.round(predictedY)));

  console.log(`Predicted Y: ${predictedY}`);
  return predictedY;
};

// Start AI Prediction (Once per second)
const startPrediction = () => {
  aiPredictionIntervalId = setInterval(() => {
    predictedY = predictBallYAtPaddle();
  }, PREDICTION_INTERVAL);
};

watch(
  () => paddlePosition,
  (newPosition) => {
    const paddleY = newPosition.y;
    const lowerBound = predictedY - MOVEMENT_WINDOW - EARLY_STOP_THRESHOLD;
    const upperBound = predictedY + MOVEMENT_WINDOW + EARLY_STOP_THRESHOLD;

    console.log('PaddleY:', paddleY, 'PredictedY:', predictedY, 'Bounds:', lowerBound, upperBound);

    if (paddleY < lowerBound && lastDirection !== 1) {
      console.log('⬆️ Moving Up');
      lastDirection = 1;
      sendDirection(1);
    } else if (paddleY > upperBound && lastDirection !== -1) {
      console.log('⬇️ Moving Down');
      lastDirection = -1;
      sendDirection(-1);
    } else if (
      paddleY >= predictedY - EARLY_STOP_THRESHOLD &&
      paddleY <= predictedY + EARLY_STOP_THRESHOLD &&
      lastDirection !== 0
    ) {
      console.log('🛑 Stopping');
      lastDirection = 0;
      sendDirection(0);
    }
  }
);

const stopAI = () => {
  if (aiPredictionIntervalId) {
    clearInterval(aiPredictionIntervalId);
  }
  if (aiMovementFrameId) {
    cancelAnimationFrame(aiMovementFrameId);
  }
  sendDirection(0);
};

onMounted(() => {
  startPrediction();
});

onUnmounted(() => {
  stopAI();
});
</script>
