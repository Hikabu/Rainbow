# Detect Docker Compose command (docker-compose or docker compose)
ifeq ($(shell command -v docker-compose),)
	COMPOSE_CMD := docker compose
else
	COMPOSE_CMD := docker-compose
endif

DATA_PATH := /home/$(USER)/data/

ENV_PATH = ./srcs/.env
COMPOSE_FILE := ./srcs/docker-compose.yml

.PHONY: setup run restart list volume clean Stopbackend

all: setup run


setup:
	@echo "Setting up the environment for ft_transcendence..."
	@mkdir -p ./secrets
	@chmod 777 ./secrets
	@docker volume rm rm srcs_frontend_build 2>/dev/null || true

run: setup
	@echo "Running the services for ft_transcendence..."
	@bash ./srcs/requirements/tools/create_ssl_cert.sh
	@$(COMPOSE_CMD) -f $(COMPOSE_FILE) up --build -d && \
	echo "Services are up and running." || \
	echo "Error: Unable to run the services."

dev: setup
	cd ./srcs/requirements/backend && source venv/bin/activate && watchfiles "daphne -b 0.0.0.0 -p 8000 project.asgi:application" &
	cd ./srcs/requirements/frontend && yarn run dev &

backend-dev: setup
	cd ./srcs/requirements/backend && source venv/bin/activate && watchfiles "daphne -b 0.0.0.0 -p 8000 project.asgi:application"

stop:
	@echo "Stopping the services for ft_transcendence..."
	@$(COMPOSE_CMD) -f $(COMPOSE_FILE) down
stopbackend:
	@$(COMPOSE_CMD) -f $(COMPOSE_FILE) down
	docker rmi srcs-backend
stopfront:
	@$(COMPOSE_CMD) -f $(COMPOSE_FILE) down
	docker rmi srcs-nginx
	docker rmi srcs-frontend


restart: stop run

rebuild:
	@$(COMPOSE_CMD) up -d --build

list:
	@echo "List of services running for ft_transcendence..."
	@docker ps -a

volume:
	@echo "List of volumes for ft_transcendence..."
	@docker volume ls

clean:
	@echo "Cleaning up the environment for ft_transcendence..."
	docker system prune -f -a --volumes
	@docker compose -f $(COMPOSE_FILE) down
	@docker stop $(docker ps -qa) 2>/dev/null || true
	@docker rm $(docker ps -qa) 2>/dev/null || true
	@docker rmi -f $(docker images -qa) 2>/dev/null || true
	@docker volume rm $(docker volume ls -q) 2>/dev/null || true
	@docker network rm $(docker network ls -q) 2>/dev/null || true
	@rm -rf ./secrets

prune:
	@echo "Pruning the environment for ft_transcendence..."
	@docker system prune -a

