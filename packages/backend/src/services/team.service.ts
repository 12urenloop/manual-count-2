import config from "../config";
import { FastifyLoggerInstance } from "fastify/types/logger";
import { TelraamTeam } from "../types/team.types";
import { axiosInstance } from "./axios.service";
import { Team } from "../models/team.model";
import { flushQueue } from "./laps.service";

// Base is 1min
let fetchInterval = 60000;
let logger: FastifyLoggerInstance;
let newTeams = 0;
let updatedTeams = 0;

/**
 * Moves a team at an oldId to his new id based on the new teamList
 * @param teams
 * @param oldId
 * @param teamName
 * @return {boolean} true if the new team at oldid is not moved
 */
const moveTeamsAtId = async (teams: TelraamTeam[], oldId: number, teamName: string): Promise<boolean> => {
  // fetch data of stored @ old id
  const teamAtOldId = await Team.findOne({ id: oldId });
  if (!teamAtOldId) {
    logger.warn(`Could not find team with id ${oldId} (name: ${teamName})`);
    return true;
  }
  const newInfo = teams.find((team) => team.name === teamName);
  if (!newInfo) {
    // TODO: move old team to a seperate table (deleted teams) so we can keep track of them if the team is readded
    logger.warn(`Could not find new id for team with name ${teamName}, Probably deleted`);
    return true;
  }
  const teamAtNewId = await Team.findOne({ id: newInfo.id });
  if (!teamAtNewId) {
    // No team at new id, Delete from database to make space for new team
    await Team.delete({ id: oldId });
    return true;
  }
  if (teamAtNewId.name === teams.find((team) => team.id === oldId)?.name) {
    // This is just a switch of id's
    // Remove teams because saved in vars and prevent errors with primary keys
    await Team.delete({ id: newInfo.id });
    await Team.delete({ id: oldId });
    // Update ids
    teamAtOldId.id = newInfo.id;
    teamAtNewId.id = oldId;
    // Save
    await teamAtOldId.save();
    await teamAtNewId.save();
    return false;
  }
  // 3rd diff team so recursion it is
  await clearIdForTeam(teams, newInfo);
  await Team.delete({ id: newInfo.id });
  teamAtOldId.id = newInfo.id;
  await teamAtOldId.save();
  return true;
};

/**
 * Checks if the team's id is updated, if so it moves the other teams around to make sure we can update this team
 * @param teams
 * @param team
 * @return {boolean} true if the team needs to be created
 */
const clearIdForTeam = async (teams: TelraamTeam[], team: TelraamTeam): Promise<boolean> => {
  // Search if a team with this name already exists
  const existingTeam = await Team.findOne({ id: team.id });
  if (existingTeam) {
    if (existingTeam.name === team.name) {
      logger.debug(`Team ${team.name} already exists`);
      // Do nothing
      return false;
    }
    // found other team under this stored team id ==> name change detected
    // Move stored team to his new id
    const needsUpdate = await moveTeamsAtId(teams, team.id, existingTeam.name);
    updatedTeams++;
    if (!needsUpdate) return false;
    // We need to update the team with the new id
    // Search team where all our info is stored
    const teamInfo = await Team.findOne({ name: team.name });
    if (!teamInfo) {
      logger.warn(`Could not find team with name ${team.name}`);
      return true;
    }
    // Update the id
    teamInfo.id = team.id;
    await teamInfo.save();
    return false;
  }
  return true;
};

const registerTeams = async (teams: TelraamTeam[]) => {
  try {
    for (let team of teams) {
      const needToCreate = await clearIdForTeam(teams, team);
      if (needToCreate) {
        newTeams++;
        logger.info(`Registering team ${team.name}`);
        // Create the new team
        const DbTeam = new Team();
        DbTeam.id = team.id;
        DbTeam.name = team.name;

        // Attempt to save the team.
        await DbTeam.save();
      }
    }
    logger.info(`Registered ${newTeams} new teams and updated ${updatedTeams} teams`);
  } catch (error) {
    logger.error(error);
  }
};

const fetchTeams = async (): Promise<void> => {
  logger.info(`Fetching teams from telraam at ${config.TELRAAM_ENDPOINT}`);
  try {
    const response = await axiosInstance.get<TelraamTeam[]>(`/team`, {
      timeout: 5000,
      responseType: "json"

    });
    if (response.status !== 200) {
      logger.error(`Failed to fetch teams from Telraam: ${response.status} ${response.statusText}`);
      return;
    }
    registerTeams(response.data);
    // We add a flush for our lap queue here because it's potentially faster than waiting for a push of another lap
    flushQueue();

  } catch (error: any) {
    if (error.response) {
      // The request was made and the server responded with a status code
      logger.error(`Could not fetch teams from Telraam but connection was made: ${error.response.status}: ${error.response.statusText}`);
      return;
    }
    if (error.request) {
      logger.error(`Could not fetch teams from Telraam, timed out after: ${error.config.timeout / 1000}s`);
      logger.error(`Did you set the correct TELRAAM_ENDPOINT in .env?`);
      return;
      // The request was made but no response was received
    }
    logger.error(error);
    throw error;
  }
};

export const setupTeams = (loggerInstance: FastifyLoggerInstance) => {
  logger = loggerInstance;
  fetchTeams();
  setInterval(() => {
    fetchTeams();
  }, fetchInterval);
};
