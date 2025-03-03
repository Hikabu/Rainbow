import { debounce } from 'shared/lib';
import { inject, onMounted, onUnmounted, provide, ref } from 'vue';

import { BALL_DEFAULT_HEIGHT } from '../components/Ball/config/constants.js';
import {
  PADDLE_DEFAULT_HEIGHT,
  PADDLE_DEFAULT_WIDTH,
} from '../components/Paddle/config/constants.js';

const useGameDimensions = (containerRef, onUpdate) => {
  const containerWidth = ref(0);
  const containerHeight = ref(0);
  const ballWidth = ref(0);
  const ballHeight = ref(BALL_DEFAULT_HEIGHT);
  const leftPaddleWidth = ref(PADDLE_DEFAULT_WIDTH);
  const leftPaddleHeight = ref(PADDLE_DEFAULT_HEIGHT);
  const rightPaddleWidth = ref(PADDLE_DEFAULT_WIDTH);
  const rightPaddleHeight = ref(PADDLE_DEFAULT_HEIGHT);

  const updateGameDimensions = () => {
    if (!containerRef?.value) {
      console.warn('Container ref is not defined or invalid.');
      return;
    }

    const { offsetWidth, offsetHeight } = containerRef.value;

    if (offsetWidth <= 0 || offsetHeight <= 0) {
      console.warn('Container dimensions are invalid:', offsetWidth, offsetHeight);
      return;
    }

    containerWidth.value = containerRef.value.offsetWidth;
    containerHeight.value = containerRef.value.offsetHeight;
    const ballHeightPixels = (ballHeight.value / 100) * containerHeight.value;
    ballWidth.value = parseFloat(((ballHeightPixels / containerWidth.value) * 100).toFixed(2));

    onUpdate({
      containerWidth: containerWidth.value,
      containerHeight: containerHeight.value,
      ballWidth: ballWidth.value,
      ballHeight: ballHeight.value,
      leftPaddleWidth: leftPaddleWidth.value,
      leftPaddleHeight: leftPaddleHeight.value,
      rightPaddleWidth: rightPaddleWidth.value,
      rightPaddleHeight: rightPaddleHeight.value,
    });
  };

  const debouncedUpdateGameDimensions = debounce(updateGameDimensions);

  onMounted(() => {
    window.addEventListener('resize', debouncedUpdateGameDimensions);
    debouncedUpdateGameDimensions();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', debouncedUpdateGameDimensions);
  });

  return {
    containerWidth,
    containerHeight,
    ballWidth,
    ballHeight,
    leftPaddleWidth,
    leftPaddleHeight,
    rightPaddleWidth,
    rightPaddleHeight,
    updateGameDimensions: debouncedUpdateGameDimensions,
  };
};

export const provideGameDimensions = (containerRef, onUpdate) => {
  provide('gameDimensions', useGameDimensions(containerRef, onUpdate));
};

export const useGameDimensionsInject = () => {
  const context = inject('gameDimensions');
  if (!context) {
    throw new Error('useGameDimensionsInject must be used within provideGameDimensions');
  }
  return context;
};

export default useGameDimensions;
