import fastify from "fastify";
import fastifyIO from "fastify-socket.io";
import fastifyCors from "fastify-cors";
import config from "./config";
import { createConnection } from "typeorm";
import { Team } from "./models/team.model";
import { Lap } from "./models/lap.model";

// Create a Fastify instance
const server = fastify({
  disableRequestLogging: true,
  logger: {
    prettyPrint: true,
  },
});

// Register the socket.io plugin
server.register(fastifyIO);

// Register the cors plugin
server.register(fastifyCors, {
  origin: true,
});

// Database connection
let connection = null;

// Available controllers
const controllers = [
  require("./controllers/hello.controller"),
  require("./controllers/time.controller"),
  require("./controllers/teams.controller"),
];

// Register each controller.
controllers.map((controller) => {
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
      entities: [Team, Lap],
    });

    server.log.info("Database connection started");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  // Start the Fastify instance
  try {
    await server.listen(config.PORT);

    server.log.info(`Server listening on ${config.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Start the server
start();