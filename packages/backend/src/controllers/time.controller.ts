import { FastifyInstance } from "fastify";

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
};
