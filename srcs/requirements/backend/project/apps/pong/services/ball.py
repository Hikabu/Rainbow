import logging
import math
import asyncio
from .constants import (
    PADDLE_BOUNDARY_GRACE_OFFSET,
    BALL_OFF_BOUNDS_OFFSET,
    BALL_DEFAULT_WIDTH,
    BALL_DEFAULT_HEIGHT,
    BALL_DEFAULT_POSITION_X,
    BALL_DEFAULT_POSITION_Y,
    BALL_MIN_VELOCITY_X,
    BALL_VELOCITY_X_INCREMENT,
    BALL_MIN_VELOCITY_Y,
    BALL_MAX_VELOCITY_CHANGE_ON_HIT,
    MAX_CURVE_ANGLE,
)

logger = logging.getLogger("game_logs")


class Ball:
    def __init__(self, width=BALL_DEFAULT_WIDTH, height=BALL_DEFAULT_HEIGHT):
        self.position = {"x": BALL_DEFAULT_POSITION_X, "y": BALL_DEFAULT_POSITION_Y}
        self.velocity = {"x": BALL_MIN_VELOCITY_X, "y": BALL_MIN_VELOCITY_Y}
        self.width = width
        self.height = height
        self.radius_x = width / 4
        self.radius_y = height / 4
        self.is_out_of_bounds = False
        self.curve = 0
        self.bouncedOffSurface = 0

    def reset(self):
        self.position = {"x": BALL_DEFAULT_POSITION_X, "y": BALL_DEFAULT_POSITION_Y}
        self.velocity = {"x": BALL_MIN_VELOCITY_X, "y": BALL_MIN_VELOCITY_Y}
        self.is_out_of_bounds = False
        self.curve = 0

    def set_ball_dimensions(self, width, height):
        self.width = width
        self.height = height
        self.radius_x = width / 4
        self.radius_y = height / 4
        logger.debug(
            f"✓ Ball dimensions set successfully: "
            f"width {self.width}, height {self.height}, "
            f"radius_x {self.radius_x}, radius_y {self.radius_y}"
        )

    def calculate_velocity_adjustment(self, paddle_position, paddle_height):
        relative_hit_position = (self.position["y"] - paddle_position) / (
            paddle_height / 2
        )
        return abs(
            BALL_MAX_VELOCITY_CHANGE_ON_HIT * max(-1, min(1, relative_hit_position))
        )

    def apply_curve(self):
        if self.curve != 0:
            self.curve = max(-MAX_CURVE_ANGLE, min(MAX_CURVE_ANGLE, self.curve))
            curve_radians = math.radians(self.curve)
            current_speed = math.sqrt(self.velocity["x"] ** 2 + self.velocity["y"] ** 2)
            angle = math.atan2(self.velocity["y"], self.velocity["x"]) + curve_radians

            self.velocity["x"] = current_speed * math.cos(angle)
            self.velocity["y"] = current_speed * math.sin(angle)

            # Gradually reduce curve effect
            self.curve *= 0.98
            if abs(self.curve) < 0.05:
                self.curve = 0

    async def update_ball(self, paddles):
        self.apply_curve()
        self.position["x"] += self.velocity["x"]
        self.position["y"] += self.velocity["y"]

        # Ball boundaries
        ball_left = self.position["x"] - self.radius_x
        ball_right = self.position["x"] + self.radius_x
        ball_top = self.position["y"] - self.radius_y
        ball_bottom = self.position["y"] + self.radius_y

        for paddle in paddles:
            paddle_lower_boundary = (
                paddle.position - (paddle.height / 2) - PADDLE_BOUNDARY_GRACE_OFFSET
            )
            paddle_upper_boundary = (
                paddle.position + (paddle.height / 2) + PADDLE_BOUNDARY_GRACE_OFFSET
            )

            if self.is_out_of_bounds and ball_left > 0 and ball_right < 100:
                self.is_out_of_bounds = False
                logger.debug(
                    f"ⓘ Ball is set to be in bounds: "
                    f"ball_left { ball_left }, ball_left + width { ball_left + self.width }, "
                    f"ball_right { ball_right }, ball_right + width { ball_right + self.width }, "
                )

            # Handle Paddles Collisions
            if not self.is_out_of_bounds:
                # Handle Left Paddle Collision
                if paddle.side == "left":
                    if (
                        self.position["x"] <= paddle.width
                        and paddle_lower_boundary
                        <= self.position["y"]
                        <= paddle_upper_boundary
                    ):
                        logger.debug(f"paddle.width { paddle.width }")
                        logger.debug(
                            f"ⓘ Ball collided with LEFT paddle: ball_left { ball_left } position_x { self.position['x'] }"
                        )

                        self.velocity["x"] -= (
                            BALL_VELOCITY_X_INCREMENT + paddle.speed / 10
                        )
                        self.velocity["x"] *= -1
                        self.position["x"] = (
                            paddle.width + self.radius_x
                        )  # Prevent ball from clipping through
                        logger.debug(
                            f"position_x after clipping handler { self.position['x']}"
                        )
                        self.velocity["y"] += self.calculate_velocity_adjustment(
                            paddle.position, paddle.height
                        )
                        self.bouncedOffSurface = 4
                        await asyncio.sleep(0.04)
                        self.curve += paddle.speed * 3
                        return {
                            "position": self.position,
                            "velocity": self.velocity,
                            "is_out_of_bounds": self.is_out_of_bounds,
                            "curve": self.curve,
                            "bounced_off_surface": self.bouncedOffSurface,
                        }

                # Handle Right Paddle Collision
                if paddle.side == "right":
                    if (
                        self.position["x"] >= 100 - paddle.width
                        and paddle_lower_boundary
                        <= self.position["y"]
                        <= paddle_upper_boundary
                    ):
                        logger.debug(
                            f"ⓘ Ball collided with RIGHT paddle: ball_right { ball_right } position_x { self.position['x'] }"
                        )

                        self.velocity["x"] += (
                            BALL_VELOCITY_X_INCREMENT + paddle.speed / 10
                        )
                        self.velocity["x"] *= -1
                        self.position["x"] = (
                            100 - paddle.width - self.radius_x
                        )  # Prevent ball from clipping through
                        logger.debug(
                            f"position_x after clipping handler { self.position['x']}"
                        )
                        self.velocity["y"] += self.calculate_velocity_adjustment(
                            paddle.position, paddle.height
                        )
                        self.bouncedOffSurface = 2
                        await asyncio.sleep(0.04)
                        self.curve -= paddle.speed * 3
                        return {
                            "position": self.position,
                            "velocity": self.velocity,
                            "is_out_of_bounds": self.is_out_of_bounds,
                            "curve": self.curve,
                            "bounced_off_surface": self.bouncedOffSurface,
                        }

                if ball_left <= 0 or ball_right >= 100:
                    logger.debug(
                        f"ⓘ Ball is set to be out of bounds: "
                        f"ball_left { ball_left }, ball_left + width { ball_left + self.width }, "
                        f"ball_right { ball_right }, ball_right + width { ball_right + self.width }, "
                    )
                    self.is_out_of_bounds = True

        # Handle Top and Bottom Collisions
        if ball_top <= 0 or ball_bottom >= 100:
            self.velocity["y"] *= -1

            if ball_top <= 0:
                logger.debug(f"ball_top: { ball_top }")
                self.position["y"] = 0 + self.radius_y
                self.bouncedOffSurface = 1
            else:
                logger.debug(f"ball_bottom: { ball_bottom }")
                self.position["y"] = 100 - self.radius_y
                self.bouncedOffSurface = 3

        # Reset when ball goes out of boundaries
        if (ball_left + self.width + BALL_OFF_BOUNDS_OFFSET) < 0 or (
            ball_right - self.width - BALL_OFF_BOUNDS_OFFSET
        ) > 100:
            self.reset()

        return {
            "position": self.position,
            "velocity": self.velocity,
            "is_out_of_bounds": self.is_out_of_bounds,
            "curve": self.curve,
            "bounced_off_surface": self.bouncedOffSurface,
        }
