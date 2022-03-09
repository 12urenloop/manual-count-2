import config from "../config";
import { TelraamTeam } from "../types/team.types";
import { Team } from "../models/team.model";
import lapsService from "./laps.service";
import axiosService from "./axios.service";
import { server } from "../main";

export class TeamService {
  private teamCache: TelraamTeam[];

  // printValue
  private newTeams = 0;
  private updatedTeams = 0;

  constructor() {
    this.fetch();
    setInterval(this.fetch, config.TEAM_FETCH_INTERVAL);
  }

  /**
   * Moves a team at an oldId to his new id based on the new teamList
   * @param teams
   * @param oldId
   * @param teamName
   * @return {boolean} true if the new team at oldid is not moved
   */
  private async moveTeamsAtId(oldId: number, teamName: string): Promise<boolean> {
    // fetch data of stored @ old id
    const teamAtOldId = await Team.findOne({ id: oldId });
    if (!teamAtOldId) {
      server.log.warn(`Could not find team with id ${oldId} (name: ${teamName})`);
      return true;
    }
    const newInfo = this.teamCache.find(team => team.name === teamName);
    if (!newInfo) {
      // TODO: move old team to a seperate table (deleted teams) so we can keep track of them if the team is readded
      server.log.warn(`Could not find new id for team with name ${teamName}, Probably deleted`);
      return true;
    }
    const teamAtNewId = await Team.findOne({ id: newInfo.id });
    if (!teamAtNewId) {
      // No team at new id, Delete from database to make space for new team
      await Team.delete({ id: oldId });
      return true;
    }
    if (teamAtNewId.name === this.teamCache.find(team => team.id === oldId)?.name) {
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
    await this.clearIdForTeam(newInfo);
    await Team.delete({ id: newInfo.id });
    teamAtOldId.id = newInfo.id;
    await teamAtOldId.save();
    return true;
  }

  /**
   * Checks if the team's id is updated, if so it moves the other teams around to make sure we can update this team
   * @param team
   * @return {boolean} true if the team needs to be created
   */
  private async clearIdForTeam(team: TelraamTeam) {
    // Search if a team with this name already exists
    const existingTeam = await Team.findOne({ id: team.id });
    if (existingTeam) {
      if (existingTeam.name === team.name) {
        server.log.debug(`Team ${team.name} already exists`);
        // Do nothing
        return false;
      }
      // found other team under this stored team id ==> name change detected
      // Move stored team to his new id
      const needsUpdate = await this.moveTeamsAtId(team.id, existingTeam.name);
      this.updatedTeams++;
      if (!needsUpdate) return false;
      // We need to update the team with the new id
      // Search team where all our info is stored
      const teamInfo = await Team.findOne({ name: team.name });
      if (!teamInfo) {
        server.log.warn(`Could not find team with name ${team.name}`);
        return true;
      }
      // Update the id
      teamInfo.id = team.id;
      await teamInfo.save();
      return false;
    }
    return true;
  }

  private async register() {
    this.newTeams = 0;
    this.updatedTeams = 0;
    try {
      for (let team of this.teamCache) {
        const needToCreate = await this.clearIdForTeam(team);
        if (needToCreate) {
          this.newTeams++;
          server.log.info(`Registering team ${team.name}`);
          // Create the new team
          const DbTeam = new Team();
          DbTeam.id = team.id;
          DbTeam.name = team.name;

          // Attempt to save the team.
          await DbTeam.save();
        }
      }
      server.log.info(`Registered ${this.newTeams} new teams and updated ${this.updatedTeams} teams`);
    } catch (error) {
      server.log.error(error);
    }
  }

  public async fetch() {
    server.log.info(`Fetching teams from telraam at ${config.TELRAAM_ENDPOINT}`);
    try {
      const response = await axiosService.request<TelraamTeam[]>("get", `/team`, {
        timeout: 5000,
        responseType: "json",
      });
      if (response.status !== 200) {
        server.log.error(`Failed to fetch teams from Telraam: ${response.status} ${response.statusText}`);
        return;
      }
      this.teamCache = response.data;
      await this.register();
      // We add a flush for our lap queue here because it's potentially faster than waiting for a push of another lap
      lapsService.flush();
    } catch (error: any) {
      return;
    }
  }
}

const teamService = new TeamService();

export default teamService;
