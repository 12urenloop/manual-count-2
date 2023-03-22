import * as dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import fastifyCors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { DataSource } from "typeorm";
import { Team } from "./models/team.model";
import { Lap } from "./models/lap.model";
import { Socket } from "socket.io";
import { TeamService } from "./services/team.service";
import config from "./config";
import { Token } from "./models/token.model";
import { LapService } from "./services/laps.service";

// Create a Fastify instance
export const server = fastify({
  disableRequestLogging: true,
  logger: {
    level: config.MODE === "production" ? "info" : "debug",
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register the socket.io plugin
server.register(fastifyIO, {
  cors: {
    origin: "*",
  },
});

// Register the cors plugin
server.register(fastifyCors, {
  origin: true,
});

server.register(fastifyStatic, {
  root: path.resolve(__dirname, "../public"),
  prefix: "/",
});

server.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});

// Open connection for socket-io clients
server.ready(err => {
  if (err) throw err;

  server.io.on("connection", (socket: Socket) => {
    server.log.debug(`Socket connected: ${socket.id}`);
  });
});

// Database connection
let dataSource = null;

// Available controllers
const controllers = [
  require("./controllers/time.controller"),
  require("./controllers/teams.controller"),
  require("./controllers/cli.controller"),
  require("./controllers/auth.controller"),
];

// Register each controller.
controllers.forEach(controller => {
  controller.default(server);
});

// Function to start the server
async function start() {
  // Start the database connection
  try {
    dataSource = new DataSource({
      type: "sqlite",
      database: "./database.sqlite",
      synchronize: true,
      entities: [Team, Lap, Token],
    })

    await dataSource.initialize();

    server.log.info("Database connection started");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  try {
    // Start team fetching
    TeamService.getInstance().fetch();
    // push the missing laps from SQLite to Telraam
    LapService.getInstance().syncMissingLaps();
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  // Start the Fastify instance
  try {
    await server.listen({port: config.PORT});
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Start the server
start();
