FROM node:15

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY scripts ./scripts
COPY src ./src
COPY tsconfig.json ./
COPY restart-db.sh ./

CMD ./scripts/entrypoint.sh
