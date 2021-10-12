import { FastifyInstance } from "fastify";
import { Lap } from "../models/lap.model";
import { Team } from "../models/team.model";
import { TeamsCreateRoute, TeamsLapsAddRoute, TeamsLapsRoute, TeamsRoute } from "../types/team.types";
import config from "../config";

export default (server: FastifyInstance) => {
  /**
   * Get list with all available teams.
   */
  server.get<TeamsRoute>("/teams", async (request, reply) => {
    return await Team.find();
  });

  /**
   * Create a new team.
   */
  server.post<TeamsCreateRoute>("/teams", async (request, reply) => {
    const body = request.body || {};

    // Make sure the team name is present
    if (!body.name) {
      return reply.code(400).send({
        error: "Team name is required",
        code: 400,
      });
    }

    // Make sure the team number is present
    if (!body.number) {
      return reply.code(400).send({
        error: "Team number is required",
        code: 400,
      });
    }

    // Make sure the team name is unique
    if (await Team.findOne({ name: body.name })) {
      return reply.code(400).send({
        error: "Team name is already taken.",
        code: 400,
      });
    }

    // Make sure the team number is unique
    if (await Team.findOne({ number: body.number })) {
      return reply.code(400).send({
        error: "Team number is already taken.",
        code: 400,
      });
    }

    // Create the new team
    const team = new Team();
    team.name = body.name;
    team.number = body.number;

    // Attempt to save the team.
    await team.save();

    return team;
  });

  /**
   * Get list with available laps for a given team.
   */
  server.get<TeamsLapsRoute>("/teams/:teamId/laps", async (request, reply) => {
    const team = await Team.findOne(request.params.teamId, { relations: ["laps"] });

    // Check if team exists
    if (!team) {
      return reply.code(404).send({
        error: "Team not found.",
        code: 404,
      });
    }

    return team.laps;
  });

  /**
   * Add a new lap for a given team.
   */
  server.post<TeamsLapsAddRoute>("/teams/:teamId/laps", async (request, reply) => {
    const body = request.body || {};
    const team = await Team.findOne(request.params.teamId);

    // Check if team exists
    if (!team) {
      return reply.code(404).send({
        error: "Team not found.",
        code: 404,
      });
    }

    // Make sure the timestamp is present.
    if (!body.timestamp) {
      return reply.code(400).send({
        error: "Timestamp is required.",
        code: 400,
      });
    }

    // Requests cannot have a timestamp in the future.
    if (body.timestamp > Date.now()) {
      return reply.code(400).send({
        error: "Timestamp cannot be in the future.",
        code: 400,
      });
    }

    // Make sure the date difference between the last lap and the new one is
    // at lease the LAP_MIN_DIFFERENCE value.
    const lastLap = await Lap.findOne({ where: { team }, order: { timestamp: "DESC" } });
    if (lastLap && body.timestamp - lastLap.timestamp < config.LAP_MIN_DIFFERENCE) {
      return reply.code(200).send({
        message: `Lap must be at least ${config.LAP_MIN_DIFFERENCE}ms apart from the last lap.`,
        code: 200,
      });
    }

    // Create a new lap and append it to the team.
    const lap = new Lap();
    lap.team = team;
    lap.timestamp = body.timestamp;

    // Attempt to save the lap
    await lap.save();

    return reply.code(200).send({
      message: "Lap has been successfully registered.",
      code: 200,
    });
  });
};
