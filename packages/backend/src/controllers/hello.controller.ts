import { FastifyInstance } from "fastify";

export default (server: FastifyInstance) => {
  server.get("/", async (request, reply) => {
    return {
      message: "This appears to be working!",
    };
  });
};
