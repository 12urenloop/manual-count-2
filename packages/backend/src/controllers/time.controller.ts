import { FastifyInstance } from "fastify";
import { Socket } from "socket.io";
import { server } from "../main";

export default (server: FastifyInstance) => {
  /**
   * Get the current server time.
   * This is used to synchronise all counting clients.
   */
  server.get("/time", async (request, reply) => {
    return {
      timestamp: Date.now(),
    };
  });

  server.ready(err => {
    server.io.on("connection", (socket) => {
      // Do a timesync for the new client
      socket.emit("time", {
        timestamp: Date.now(),
      });
    });
  });

  // Do a timesync for all clients every 1 minute
  setInterval(() => {
    server.io.emit("time", {
      timestamp: Date.now(),
    });
  }, 1000 * 60);
};
