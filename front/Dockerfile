FROM node:15

WORKDIR /app

RUN npm install -g @vue/cli
RUN npm install -g http-server

COPY package.json yarn.lock ./
RUN yarn install

COPY src ./src
COPY public ./public
COPY babel.config.js .

RUN yarn build

WORKDIR /app/dist
CMD http-server
