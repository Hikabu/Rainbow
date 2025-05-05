import json
import struct
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from .services import (
    GameState,
    Ball,
    Paddle,
    GAME_STATUS_IDLE,
    GAME_STATUS_INIT,
    GAME_STATUS_COUNTDOWN,
    GAME_STATUS_IN_PROGRESS,
    GAME_STATUS_ENDED,
    DEMO_GAME_MODE,
    QUICK_START_GAME_MODE,
    GAME_STATE_UPDATE_INTERVAL,
    BALL_DEFAULT_WIDTH,
    BALL_DEFAULT_HEIGHT,
)

logger = logging.getLogger("game_logs")


class PongConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.game_state = None
        self.ball = None
        self.paddles = {}
        self.are_dimensions_set = False
        self.game_update_task = None
        self.paddle_update_task = None

    async def connect(self):
        self.game_state = GameState()
        self.ball = Ball()
        await self.accept()
        await self.set_game_status(GAME_STATUS_IDLE)
        logger.debug("✓ Pong WebSocket Connected")

    async def disconnect(self, close_code):
        if self.game_update_task:
            self.game_update_task.cancel()
            await self.set_game_status(GAME_STATUS_ENDED)
        logger.debug("ⓘ Pong WebSocket Disconnected")

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)
            action = data.get("action")

            if action == "update_dimensions":
                await self.handle_update_dimensions(data)

            elif action == "start":
                await self.handle_start(data)

            elif action == "restart":
                await self.handle_start(data)

            elif action == "stop":
                await self.handle_stop()

            elif action == "update_paddle":
                await self.handle_paddle(data)

            else:
                await self.send(text_data=json.dumps({"error": "Unknown action"}))

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Invalid JSON"}))

    async def handle_update_dimensions(self, data):
        self.ball.set_ball_dimensions(
            data.get("ball_width", BALL_DEFAULT_WIDTH),
            data.get("ball_height", BALL_DEFAULT_HEIGHT),
        )

        if not self.are_dimensions_set:
            self.are_dimensions_set = True
            logger.debug("✓ Dimensions set successfully")
            await self.send_game_state("✓ Dimensions set successfully")

    async def handle_start(self, data):
        logger.debug(f"ⓘ Game Settings: { data }")

        await self.set_game_status(GAME_STATUS_INIT)

        settings = data.get("settings", {})
        mode = settings.get("mode")
        controllers = settings.get("controllers", [])

        if not controllers:
            logger.debug("✕ Cannot start game: No controllers found in settings!")
            await self.send_game_state(
                "✕ Cannot start game: No controllers found in settings!"
            )
            await self.set_game_status(GAME_STATUS_IDLE)
            return

        self.paddles = {}
        for ctrl in controllers:
            paddle_name = ctrl["name"]
            paddle_side = ctrl["side"]
            self.paddles[paddle_name] = Paddle(name=paddle_name, side=paddle_side)
            logger.debug(f"✓ Created paddle: {paddle_name}")

        if self.game_update_task:
            self.ball.reset()
            for paddle in self.paddles.values():
                paddle.reset()
            self.game_update_task.cancel()
            logger.debug(
                "✓ Game update loop canceled as part of initializing a new loop process"
            )
            await self.set_game_status(GAME_STATUS_ENDED)

        try:
            self.game_update_task = asyncio.create_task(self.game_update_loop())
            if mode != DEMO_GAME_MODE and mode != QUICK_START_GAME_MODE:
                await self.set_game_status(GAME_STATUS_COUNTDOWN)
                # for countdown in range(3, -1, -1):  # Countdown from 3 to 0
                #     logger.debug(f"ⓘ Countdown: {countdown}")
                #     await self.send_game_state(f"ⓘ Countdown: {countdown}")
                #     await asyncio.sleep(1)

            await self.set_game_status(GAME_STATUS_IN_PROGRESS)
            logger.debug("✓ Game update loop started")
        except Exception as e:
            logger.debug(f"✕ Failed to start new game update loop: {e}")

    async def handle_paddle(self, data):
        paddle_name = data.get("name")
        direction = data.get("direction", 0)

        if paddle_name in self.paddles:
            self.paddles[paddle_name].set_direction(direction)
            # logger.debug(f"ⓘ Paddle '{paddle_name}' direction set: {direction}")

    async def handle_stop(self):
        if self.game_update_task:
            self.game_update_task.cancel()
        await self.set_game_status(GAME_STATUS_ENDED)
        await self.set_game_status(GAME_STATUS_IDLE)

    async def set_game_status(self, status):
        self.game_state.status = status
        logger.debug(f"✓ Game state updated to {status}")
        await self.send_game_state(f"Game status updated to {status}")

    async def send_game_state(self, message):
        payload = struct.pack(
            "<B i i",
            1,  # message_type
            self.game_state.status,
            self.game_state.countdown_value,
            # self.game_state.score.left,
            # self.game_state.score.right,
            # self.game_state.tie_breaker
        )

        await self.send(bytes_data=payload)

    async def game_update_loop(self):
        try:
            while True:
                for paddle in self.paddles.values():
                    paddle.update_position()

                updated_ball = await self.ball.update_ball(self.paddles.values())

                payload_format = "<B f f f f B f B" + (" f f f f" * len(self.paddles))
                payload_values = [
                    2,  # message_type (1 byte)
                    updated_ball["position"]["x"],  # (4 bytes)
                    updated_ball["position"]["y"],  # (4 bytes)
                    updated_ball["velocity"]["x"],  # (4 bytes)
                    updated_ball["velocity"]["y"],  # (4 bytes)
                    int(updated_ball["is_out_of_bounds"]),  # (1 byte)
                    updated_ball["curve"],  # (4 bytes)
                    updated_ball["bounced_off_surface"],  # (1 byte)
                ]

                # logger.debug(f"ⓘ Struct format: {payload_format}")
                # logger.debug(f"ⓘ Payload values before packing: {payload_values}")

                offset = struct.calcsize("<B f f f f B f B")  # Calculate base size
                for paddle in self.paddles.values():
                    # logger.debug(f"ⓘ Packing paddle at offset {offset}: {paddle.name},"
                    #              f"position: {paddle.position}, speed: {paddle.speed}")
                    payload_values.extend(
                        [
                            paddle.width,  # (4 bytes)
                            paddle.height,  # (4 bytes)
                            paddle.position,  # (4 bytes)
                            paddle.speed,  # (4 bytes)
                        ]
                    )
                    offset += struct.calcsize("<f f f f")

                # logger.debug(f"ⓘ Total payload size: {len(payload_values) * 4} bytes (before packing)")

                payload = struct.pack(payload_format, *payload_values)
                await self.send(bytes_data=payload)
                await asyncio.sleep(GAME_STATE_UPDATE_INTERVAL)

        except asyncio.CancelledError:
            logger.info("✓ Game update loop cancelled.")
        except Exception as e:
            logger.error(f"✕ Error in game update loop: {e}")
