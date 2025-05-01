
import time, random, numpy as np
from .logic_ball import Ball
from .logic_paddle import Paddle

class GameLogic:
	duration = 15.0

	def __init__(self, gameID):
		self.id = gameID #needed for user validation for paddles
		self.ball = Ball()
		self.paddles = {
			1: Paddle(1, self.move_by_ai, gameID),
			-1: Paddle(-1, self.move_by_ai, gameID),
		}
		self.start_time = time.time()
		self.active = False
		self.state = "countdown"
		self.update_state = self.update_countdown
		self.countdown_timer = self.start_time
		self.countdown_num = 4
		self.ai_prev_direction = 1
		self.last_ai_update = 0
		self.last_ai_direction = 0
		self.last_valid_prediction = 0

	def update_paddles(self, data):
		side = data["side"]
		if not self.paddles[-1].valid_user(self) or not self.paddles[1].valid_user(self):
			return
		direction = data["direction"]
		self.paddles[side].dir = direction
		if (direction == 0):
			self.paddles[side].speed = self.paddles[side].defaultSpeed

	def update_countdown(self):
		update = {}
		if time.time() - self.countdown_timer >= 1 or self.active == False:
			self.active = True
			self.countdown_num -= 1
			if (self.countdown_num < 0):
				self.update_state = self.update_play
			else:
				update["state"] = "countdown"
				update["num"] = self.countdown_num
			self.countdown_timer = time.time()
		return update
	
	def update_play(self):
		self.paddles[1].move()
		self.paddles[-1].move()
		self.ball.move()
		self.ball.collision(1.0, self.paddles)
		
		update = {}
		update["state"] = "playing"
		if (time.time() - self.start_time >= self.duration):
			self.active = False
			update["state"] = "game end"
		update["x"] = [self.ball.pos["x"]]
		update["y"] = [self.ball.pos["y"], self.paddles[-1].pos_y, self.paddles[1].pos_y]
		update["score1"] = self.paddles[-1].score
		update["score2"] = self.paddles[1].score
		return update

	#TO DO BY MORAND:
	def predict_final_ball_position(self):
		# We only predict when the ball is moving toward the right edge.
		if self.ball.dir["x"] <= 0:
			# If ball is moving left, return its current y.
			return self.ball.pos["y"]
	
		# If the ball is already at or past the right edge, return stored prediction (or current y).
		if self.ball.pos["x"] >= 1:
			return getattr(self, 'last_valid_prediction', self.ball.pos["y"])
	
		# Copy the current ball state
		x = self.ball.pos["x"]
		y = self.ball.pos["y"]
		dx = self.ball.dir["x"]
		dy = self.ball.dir["y"]
		speed = self.ball.speed
		maxY = 1.0  # boundary as used in collisions
	
		# Simulate discrete updates until the ball crosses x == 1.
		while x < 1:
			prev_x = x
			prev_y = y
	
			# Update ball position
			x += dx * speed
			y += dy * speed
	
			# Apply collision logic
			if y > maxY:
				y = maxY
				dy *= -1
			elif y < -maxY:
				y = -maxY
				dy *= -1
	
			# When the ball crosses the right edge, interpolate to get the exact y at x == 1.
			if x >= 1:
				frac = (1 - prev_x) / (x - prev_x) # Fraction of the distance to the right edge
				final_y = prev_y + frac * (y - prev_y) # Interpolate y at x == 1
				self.last_valid_prediction = final_y # Store the prediction
				return final_y
	
		return y
	
	def move_by_ai(self):
		paddle = self.paddles[1]
		current_time = time.time()
	
		if self.ball.dir["x"] < 0:
			paddle.speed = paddle.defaultSpeed
			return

		# Only update prediction once per second
		if current_time - self.last_ai_update < 1.0:
			direction = self.last_ai_direction
			predicted_y = self.last_valid_prediction
		else:
			# Calculate exact intersection point
			predicted_y = self.predict_final_ball_position()
			self.last_ai_update = current_time

		# Add randomized error based on distance
		distance_to_ball = abs(paddle.pos_x - self.ball.pos["x"])
		failure_chance = 0.10 * (1 - (distance_to_ball / paddle.pos_x))
		
		if random.random() < failure_chance:
			if random.random() < 0.10:
				prediction_error = paddle.half_len * 2 * random.choice([-1, 1])
			else:
				prediction_error = random.uniform(-paddle.half_len, paddle.half_len)
			predicted_y += prediction_error

		# Calculate distance between predicted y position and paddle's y position
		distance_to_target = abs(predicted_y - paddle.pos_y)

		# Tolerance to avoid jittering
		tolerance = paddle.half_len * 0.3

		# Move the paddle up or down
		direction = 0

		# If the distance to the target is greater than the tolerance, move the paddle
		if distance_to_target > tolerance:
			if predicted_y > paddle.pos_y:
				direction = 1 # Move up
			else:
				direction = -1 # Move down

		# Store last calculation time and direction
		self.last_ai_direction = direction
		self.last_valid_prediction = predicted_y
	
		# Update paddle movement
		if direction != 0:
			paddle.speed = min(paddle.speed + paddle.accelaration, paddle.max_speed)
		else:
			paddle.speed = paddle.defaultSpeed
	
		# Move paddle
		paddle.pos_y += direction * paddle.speed
		paddle.pos_y = max(paddle.minY, min(paddle.maxY, paddle.pos_y))

