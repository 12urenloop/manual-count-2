import { FastifyInstance } from "fastify";
import { Lap } from "../models/lap.model";
import { Team } from "../models/team.model";
import { TeamsLapsAddRoute, TeamsLapsRoute, TeamsRoute } from "../types/team.types";
import config from "../config";
import { TelraamLapService } from "../services/telraamlaps.service";
import { Between, Equal } from "typeorm";
import { lapStoreService } from "../services/lapsStore.service";

export default (server: FastifyInstance) => {
  /**
   * Get list with all available teams.
   */
  server.get<TeamsRoute>("/teams", async (request, reply) => {
    return Team.find();
  });

  /**
   * Get list with available laps for a given team.
   */
  server.get<TeamsLapsRoute>("/teams/:teamId/laps", async (request, reply) => {
    const team = await Team.findOne({ where:{
      id: request.params.teamId,
    }, relations: ["laps"] });

    // Check if team exists
    if (!team) {
      return reply.code(404).send({
        error: "Team not found.",
        code: 404
      });
    }

    return team.laps;
  });

  /**
   * Add a new lap for a given team.
   */
  server.post<TeamsLapsAddRoute>("/teams/:teamId/laps", async (request, reply) => {
    const body = request.body || {};
    const team = await Team.findOneBy({ id: request.params.teamId });

    // Check if team exists
    if (!team) {
      return reply.code(404).send({
        error: "Team not found.",
        code: 404
      });
    }

    // Make sure the timestamp is present.
    if (!body.timestamp) {
      return reply.code(400).send({
        error: "Timestamp is required.",
        code: 400
      });
    }

    // Requests cannot have a timestamp in the future.
    if (body.timestamp > Date.now()) {
      return reply.code(400).send({
        error: "Timestamp cannot be in the future.",
        code: 400
      });
    }

    lapStoreService.scheduleLap({
      teamId: request.params.teamId,
      timestamp: body.timestamp,
    })

    // Broadcast the lap to all connected clients.
    server.io.emit("updateTeam", {
      teamId: team.id,
      laps: team.laps
    });

    return reply.code(200).send({
      message: "Lap has been successfully registered.",
      code: 200
    });
  });
};
