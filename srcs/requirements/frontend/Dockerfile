FROM node:20 AS build

LABEL org.opencontainers.image.authors="Lera, Arturo, Morand"
WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install
COPY . .
RUN yarn build

CMD ["echo", "Frontend build completed successfully"]
