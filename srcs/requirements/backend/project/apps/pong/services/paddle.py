import logging
from .constants import (
    PADDLE_DEFAULT_WIDTH,
    PADDLE_DEFAULT_HEIGHT,
    PADDLE_STRETCHING_FACTOR,
    PADDLE_MAX_SPEED,
    PADDLE_ACCELERATION,
    PADDLE_DEACCELERATION,
)

logger = logging.getLogger("pong.paddle")


class Paddle:
    def __init__(
        self,
        name,
        side,
        position=50,
        boundary=100,
        width=PADDLE_DEFAULT_WIDTH,
        height=PADDLE_DEFAULT_HEIGHT,
    ):
        self.name = name
        self.side = side
        self.position = position
        self.direction = 0
        self.speed = 0
        self.boundary = boundary
        self.width = width
        self.base_height = height  # Minimum height of the paddle
        self.height = height  # Current height of the paddle

    def reset(self):
        self.position = 50
        self.direction = 0
        self.speed = 0

    def update_position(self):
        # Update speed based on direction
        if self.direction != 0:
            self.speed += PADDLE_ACCELERATION * self.direction
            self.speed = max(-PADDLE_MAX_SPEED, min(self.speed, PADDLE_MAX_SPEED))
        else:
            if self.speed > 0:
                self.speed -= PADDLE_DEACCELERATION
                self.speed = max(
                    0, self.speed
                )  # Prevent negative speed when decelerating
            elif self.speed < 0:
                self.speed += PADDLE_DEACCELERATION
                self.speed = min(
                    0, self.speed
                )  # Prevent positive speed when decelerating

        # Update position based on speed
        self.position += self.speed

        # Clamp paddle position to stay within boundaries
        half_paddle_height = self.height / 1.8
        self.position = max(
            half_paddle_height, min(self.boundary - half_paddle_height, self.position)
        )

        # Adjust paddle height based on speed, but only if not near the edges
        stretch_factor = (
            PADDLE_STRETCHING_FACTOR + abs(self.speed) / PADDLE_MAX_SPEED
        )  # Stretch more at higher speed
        if half_paddle_height < self.position < self.boundary - half_paddle_height:
            # Stretch the height if not near top or bottom boundary
            self.height = max(self.base_height, self.base_height * stretch_factor)
            self.height = min(
                self.height, self.base_height * 2
            )  # Clamp to a max stretch (e.g., 1.5x)
        else:
            # Reset to base height when near edges
            self.height = self.base_height

        return self.position

    def set_direction(self, direction):
        if direction in [-1, 0, 1]:
            self.direction = direction
