import random
import math

class Ball:
	def __init__(self):
		self.pos = {"x":0, "y": 0}
		self.dir = {"x": random.choice([1, -1]), "y": random.choice([1, -1])}
		self.defaultSpeed = 0.02
		self.speed = self.defaultSpeed
		self.reduce_speed = 0
		self.accelaration_build_up = 1.01
		self.accelaration_middle_hit = 1.2
		self.max_speed = 0.15
		self.ball_y = self.pos["y"]

	def move(self):
		if (self.defaultSpeed * 1.00001 < self.max_speed):
			self.defaultSpeed *= 1.00001
		self.pos["x"] += self.speed * self.dir["x"]
		self.pos["y"] += self.speed * self.dir["y"]
	
	def collision(self, maxY, paddles):
		#bounce at top-bottom edges
		if self.pos["y"] >= maxY or self.pos["y"] <= -maxY:
			if self.pos["y"] > maxY:
				self.pos["y"] = maxY
			if self.pos["y"] < -maxY:
				self.pos["y"] = -maxY
			self.dir["y"] *= -1
		#towards paddles
		paddles[1].check_collision(self, paddles[-1])
		paddles[-1].check_collision(self, paddles[1])
	
	def random_x_dir(self, axis):
		self.dir["x"] = random.uniform(0.25 * axis, 0.5 * axis)
		self.dir["y"] *= 2
		# print("random dir: ", self.dir["x"])
		length = math.sqrt(self.dir["x"] ** 2 + self.dir["y"] ** 2)
		if (length != 0):
			self.dir["x"] /= length
			self.dir["y"] /= length
	