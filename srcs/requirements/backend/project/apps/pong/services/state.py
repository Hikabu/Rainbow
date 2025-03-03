import json
import logging

from .constants import GAME_STATUS_IDLE, GAME_COUNTDOWN_DURATION

logger = logging.getLogger("pong.consumer")


class GameState:
    def __init__(self):
        self._status = GAME_STATUS_IDLE
        self._countdown_value = 0
        self._score = {"left": 0, "right": 0}
        self._tie_breaker = False

    # Status getters and setters
    @property
    def status(self):
        return self._status

    @status.setter
    def status(self, value):
        logger.debug(f"Setting game status: {value}")
        self._status = value

    # Countdown value getters and setters
    @property
    def countdown_value(self):
        return self._countdown_value

    @countdown_value.setter
    def countdown_value(self, value):
        if value < 0:
            raise ValueError("Countdown value cannot be negative")
        logger.debug(f"Setting countdown value: {value}")
        self._countdown_value = value

    # Score getters and setters
    @property
    def score(self):
        return self._score

    @score.setter
    def score(self, value):
        if not isinstance(value, dict) or not {"left", "right"}.issubset(value.keys()):
            raise ValueError("Score must be a dictionary with 'left' and 'right' keys")
        logger.debug(f"Setting score: {value}")
        self._score = value

    # Tie-breaker getters and setters
    @property
    def tie_breaker(self):
        return self._tie_breaker

    @tie_breaker.setter
    def tie_breaker(self, value):
        if not isinstance(value, bool):
            raise ValueError("Tie-breaker must be a boolean")
        logger.debug(f"Setting tie breaker: {value}")
        self._tie_breaker = value

    # Serialize the current game state for sending to clients
    def to_dict(self):
        return {
            "status": self._status,
            "countdown_value": self._countdown_value,
            "score": self._score,
            "tie_breaker": self._tie_breaker,
        }

    def to_json(self):
        return json.dumps(self.to_dict())

    # Reset the game state to its initial values
    def reset(self):
        logger.debug("Resetting game state to initial values")
        self._status = GAME_STATUS_IDLE
        self._countdown_value = GAME_COUNTDOWN_DURATION
        self._score = {"left": 0, "right": 0}
        self._tie_breaker = False
