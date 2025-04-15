from rest_framework.decorators import api_view
from rest_framework.response import Response
import random
import time
from .playLog import get_paddle_type
import math

class Paddle:
	accelaration = 0.01

	def __init__(self, side, move_by_ai, gameID):
		self.half_len = 0.15
		self.owner = "local" #FETCH FROM SET UP GAME //will be userid, "X", or "AI"
		self.owner = get_paddle_type(gameID, side)
		self.pos_y = 0
		self.pos_x = side
		self.defaultSpeed = self.half_len / 10
		self.speed = self.defaultSpeed - self.accelaration
		self.side = side
		self.score = 0
		self.dir = 0
		self.move = move_by_ai if self.owner == "AI" else self.move_by_user
		self.maxY = 0.95 + self.half_len
		self.minY = -0.95 - self.half_len
		self.max_speed = self.defaultSpeed * 10
		self.center = self.pos_y
		self.top = self.pos_y + self.half_len
		self.bottom = self.pos_y - self.half_len

	def move_by_user(self):
		if self.dir == 0:
			return False
		self.speed += self.accelaration
		if self.speed > self.max_speed:
			self.speed = self.max_speed
		self.pos_y += self.dir * self.speed
		if self.pos_y > self.maxY:
			self.pos_y = self.maxY
		if self.pos_y < self.minY:
			self.pos_y = self.minY
		return True

	def valid_user(self, game):
		return True #TO DO!
		#FETCH FROM SET UP GAME ... AND MATCH WITH USER ID

	def check_collision(self, ball, oponent):
		if ball.pos["x"] * self.side >= self.pos_x * self.side:
			if ball.pos["y"] >= self.pos_y - self.half_len and ball.pos["y"] <= self.pos_y  + self.half_len:
				ball.dir["y"] = random.uniform(-1.0, 1.0)
				ball.random_x_dir(self.side * -1)
				if ball.reduce_speed != 0:
					ball.speed = ball.reduce_speed
					ball.reduce_speed = 0
				if (ball.speed * ball.accelaration_middle_hit < ball.max_speed):
					if (ball.pos["y"] == self.pos_y):
						ball.reduce_speed = ball.speed
						ball.speed *= ball.accelaration_build_up
					else:
						ball.speed *= ball.accelaration_middle_hit
			else:
				oponent.score += 1
				ball.pos["x"] = 0
				ball.pos["y"] = random.uniform(-0.75, 0.75)
				ball.dir["y"] = random.uniform(-1.0, 1.0)
				ball.random_x_dir(self.side)
				ball.speed = ball.defaultSpeed