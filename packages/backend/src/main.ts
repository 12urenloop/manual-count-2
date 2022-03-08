import "dotenv/config";
import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import fastifyCors from "fastify-cors";
import fastifySwagger from "fastify-swagger";
import fastifyStatic from 'fastify-static';
import config from "./config";
import path from "path";
import { createConnection } from "typeorm";
import { statSync } from "fs";
import { Team } from "./models/team.model";
import { Lap } from "./models/lap.model";

// Create a Fastify instance
export const server = fastify({
  disableRequestLogging: true,
  logger: {
    level: config.MODE === "production" ? "info" : "debug",
    prettyPrint: true
  }
});

// Register the socket.io plugin
server.register(fastifyIO, {
  cors: {
    origin: true
  }
});

// Register the cors plugin
server.register(fastifyCors, {
  origin: true
});

// Register szqgger plugin
server.register(fastifySwagger, {
  routePrefix: "/swagger",
  exposeRoute: true,
  swagger: {
    info: {
      title: "Manual Count API",
      description: "API for Manual Count",
      version: "1.0.0"
    }
  }
});

server.register(fastifyStatic, {
  root: path.resolve(__dirname, '../public'),
  prefix: '/',
});

server.get('/', async (request, reply) => {
  console.log(statSync(path.resolve(__dirname, '../public/index.html')).isFile());
  reply.sendFile('index.html');
});

// Open connection for socket-io clients
server.ready(err => {
  if (err) throw err;

  server.io.on("connection", socket => {
    server.log.debug(`Socket connected: ${socket.id}`);
  });
});

// Database connection
let connection = null;

// Available controllers
const controllers = [require("./controllers/time.controller"), require("./controllers/teams.controller")];

// Register each controller.
controllers.forEach((controller) => {
  controller.default(server);
});

// Function to start the server
async function start() {
  // Start the database connection
  try {
    connection = await createConnection({
      type: "sqlite",
      database: "./database.sqlite",
      synchronize: true,
      entities: [Team, Lap]
    });

    server.log.info("Database connection started");

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  // Start the Fastify instance
  try {
    await server.listen(config.PORT, "0.0.0.0");

  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Start the server
start();
