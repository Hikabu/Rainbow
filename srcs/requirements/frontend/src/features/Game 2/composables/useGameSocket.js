import {
  CONTROLLERS_INPUT_NAME,
  DEMO_DEFAULT_GAME_SETTINGS,
  GAME_STATE_MESSAGE_TYPE,
  GAME_STATUS_IDLE,
  GAME_UPDATE_MESSAGE_TYPE,
} from 'entities/Game/config/constants.js';
import { convertObjectKeys, toSnakeCase, useWebSocket } from 'shared/lib';
import { inject, onUnmounted, provide, ref } from 'vue';

const useGameSocket = (url) => {
  let animationFrameId;

  const paddleNames = ref([]);

  // Game State
  const status = ref(0);
  const countdown = ref(0);

  // Ball State
  const ballPositionX = ref(0);
  const ballPositionY = ref(0);
  const ballVelocityX = ref(0);
  const ballVelocityY = ref(0);
  const isBallOutOfBounds = ref(false);
  const ballCurve = ref(0);
  const ballBouncedOffSurface = ref(0);

  const paddleWidths = ref([]);
  const paddleHeights = ref([]);
  const paddlePositions = ref([]);
  const paddleSpeeds = ref([]);

  const actions = {};

  function handleMessage(dataView) {
    const messageType = dataView.getUint8(0);

    if (dataView.byteLength < 3) {
      console.error(
        '❌ Invalid GAME_STATE_MESSAGE_TYPE: Insufficient data length',
        dataView.byteLength
      );
      return;
    }

    if (messageType === GAME_STATE_MESSAGE_TYPE) {
      status.value = dataView.getUint8(1);
      countdown.value = dataView.getUint8(2);

      if (status.value === GAME_STATUS_IDLE) {
        actions.startGame(DEMO_DEFAULT_GAME_SETTINGS);
      }
    }

    if (messageType === GAME_UPDATE_MESSAGE_TYPE) {
      let offset = 1;

      const minBallStateSize = 1 + 4 * 4 + 1 + 4 + 1; // B, f f f f B f B
      if (dataView.byteLength < minBallStateSize) {
        console.error(
          '❌ Invalid GAME_UPDATE_MESSAGE_TYPE: Payload too short for ball state',
          dataView.byteLength
        );
        return;
      }

      // Ball State
      ballPositionX.value = dataView.getFloat32(offset, true);
      offset += 4;
      ballPositionY.value = dataView.getFloat32(offset, true);
      offset += 4;
      ballVelocityX.value = dataView.getFloat32(offset, true);
      offset += 4;
      ballVelocityY.value = dataView.getFloat32(offset, true);
      offset += 4;
      isBallOutOfBounds.value = dataView.getUint8(offset) === 1;
      offset += 1;
      ballCurve.value = dataView.getFloat32(offset, true);
      offset += 4;
      ballBouncedOffSurface.value = dataView.getUint8(offset);
      offset += 1;

      const paddleDataSize = 4 * 4;
      const expectedSize = minBallStateSize + paddleNames.value.length * paddleDataSize;

      if (dataView.byteLength < expectedSize) {
        console.error(
          `❌ Incomplete paddle data: Expected ${expectedSize}, got ${dataView.byteLength}`
        );
        return;
      }

      // Paddle States
      for (let i = 0; i < paddleNames.value.length; i++) {
        paddleWidths.value[i] = dataView.getFloat32(offset, true);
        offset += 4;
        paddleHeights.value[i] = dataView.getFloat32(offset, true);
        offset += 4;
        paddlePositions.value[i] = dataView.getFloat32(offset, true);
        offset += 4;
        paddleSpeeds.value[i] = dataView.getFloat32(offset, true);
        offset += 4;
      }
    }
  }

  const {
    socket,
    sendMessage,
    close: closeGameSocket,
    ...rest
  } = useWebSocket(url, {
    onMessage: handleMessage,
    binaryType: 'arraybuffer',
  });

  function startGame(settings) {
    if (!settings) return;

    const sanitizedSettings = {
      ...settings,
      [CONTROLLERS_INPUT_NAME]: settings[CONTROLLERS_INPUT_NAME]?.filter(
        (controller) => controller.side !== undefined && controller.side !== null
      ),
    };

    paddleNames.value = sanitizedSettings[CONTROLLERS_INPUT_NAME]?.map(({ name }) => name);

    sendMessage({ action: 'start', settings: sanitizedSettings });
  }

  function stopGame() {
    sendMessage({ action: 'stop' });
  }

  function pauseGame() {
    sendMessage({ action: 'pause' });
  }

  function resetGame() {
    sendMessage({ action: 'reset' });
  }

  function updatePaddlePosition(data) {
    sendMessage({
      action: 'update_paddle',
      ...convertObjectKeys(data, toSnakeCase),
    });
  }

  function updateGameDimensions(data) {
    sendMessage({
      action: 'update_dimensions',
      ...convertObjectKeys(data, toSnakeCase),
    });
  }

  Object.assign(actions, {
    closeGameSocket,
    handleMessage,
    startGame,
    stopGame,
    pauseGame,
    resetGame,
    updatePaddlePosition,
    updateGameDimensions,
  });

  onUnmounted(() => {
    cancelAnimationFrame(animationFrameId);
  });

  return {
    socket,
    status,
    ballPositionX,
    ballPositionY,
    ballVelocityX,
    ballVelocityY,
    isBallOutOfBounds,
    ballCurve,
    ballBouncedOffSurface,
    paddleWidths,
    paddleHeights,
    paddlePositions,
    paddleSpeeds,
    actions,
    ...rest,
  };
};

export const provideGameSocket = (url) => {
  const gameState = useGameSocket(url);
  provide('gameState', gameState);
};

export const useGameSocketInject = () => {
  const context = inject('gameState');
  if (!context) {
    throw new Error('useGameStateInject must be used within provideGameState');
  }
  return context;
};

export default useGameSocket;
