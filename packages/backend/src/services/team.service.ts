import config from "../config";
import { TelraamTeam } from "../types/team.types";
import { Team } from "../models/team.model";
import { AxiosService } from "./axios.service";
import { server } from "../main";
import { TelraamLapService } from "./telraamlaps.service";

export class TeamService {
  // region SingleTon
  private static Instance: TeamService;

  public static getInstance(): TeamService {
    if (!this.Instance) {
      this.Instance = new TeamService();
    }
    return this.Instance;
  }

  // endregion
  private teamCache: TelraamTeam[];

  // printValue
  private newTeams = 0;
  private updatedTeams = 0;

  constructor() {
    setInterval(this.fetch, config.TEAM_FETCH_INTERVAL);
  }

  public createInstance(): TeamService {
    return new TeamService();
  }

  /**
   * Moves a team at an oldId to his new id based on the new teamList
   */
  private async moveTeamsAtId(oldId: number, teamName: string): Promise<boolean> {
    // fetch data of stored @ old id
    const teamAtOldId = await Team.findOneBy({ id: oldId });
    if (!teamAtOldId) {
      server.log.warn(`moveTeamAtId: Could not find team with id ${oldId} (name: ${teamName})`);
      return true;
    }
    const newInfo = this.teamCache.find(team => team.name === teamName);
    if (!newInfo) {
      // TODO: move old team to a seperate table (deleted teams) so we can keep track of them if the team is readded
      server.log.warn(`moveTeamAtId: Could not find new id for team with name ${teamName}, Probably deleted`);
      return true;
    }
    const teamAtNewId = await Team.findOneBy({ id: newInfo.id });
    if (!teamAtNewId) {
      // No team at new id, Delete from database to make space for new team
      server.log.warn(`moveTeamAtId: Could not find team with id ${newInfo.id} (name: ${teamName} | oldId: ${oldId})`);
      Team.update({ id: oldId }, { id: newInfo.id });
      return false;
    }
    const teamWithHighestId = await Team.findOne({
      order: {
        id: "DESC",
      },
    });
    const tempId = (teamWithHighestId?.id ?? 0) + 1;

    if (teamAtNewId.name === this.teamCache.find(team => team.id === oldId)?.name) {
      // This is just a switch of id's
      // New --> Temp
      await Team.update({ id: newInfo.id }, { id: tempId });
      // Old --> New
      await Team.update({ id: oldId }, { id: newInfo.id });
      // Temp --> Old
      await Team.update({ id: tempId }, { id: oldId });
      return false;
    }
    // 3rd diff team found
    // Move info at teamAtOldId to a high id
    Team.update({ id: oldId }, { id: tempId });
    // Move team at new id
    server.log.debug(`moveTeamAtId: Moving team with id ${newInfo.id} (name: ${teamName}) to id ${tempId}`);
    await this.clearIdForTeam(newInfo);
    // // clear team at old id
    // await Team.delete({ id: newInfo.id });
    // Assign real new id
    Team.update({ id: tempId }, { id: newInfo.id });
    return true;
  }

  /**
   * Checks if the team's id is updated, if so it moves the other teams around to make sure we can update this team
   */
  private async clearIdForTeam(team: TelraamTeam) {
    // Search if a team with this name already exists
    const existingTeam = await Team.findOneBy({ id: team.id });
    if (existingTeam) {
      if (existingTeam.name === team.name) {
        if (existingTeam.jacketNr !== team.jacketNr) {
          server.log.debug(`clearIdForTeam: Team ${team.name} already exists with different jacket number`);
          Team.update({ id: team.id }, { jacketNr: team.jacketNr });
        }
        server.log.debug(`clearIdForTeam: Team ${team.name} already exists`);
        // Do nothing
        return false;
      }
      // found other team under this stored team id ==> name change detected
      // Move stored team to his new id
      const needsUpdate = await this.moveTeamsAtId(team.id, existingTeam.name);
      this.updatedTeams++;
      server.log.debug(`clearIdForTeam: Team ${team.name} ${needsUpdate ? "needs" : "does not need"} to be updated`);
      if (!needsUpdate) return false;
      // We need to update the team with the new id
      // Search team where all our info is stored
      const teamInfo = await Team.findOneBy({ name: team.name });
      if (!teamInfo) {
        server.log.warn(`clearIdForTeam: Could not find team with name ${team.name}`);
        return true;
      }
      server.log.debug(`clearIdForTeam: Updating team ${team.name} with id ${team.id} (new id: ${teamInfo.id})`);
      // Update the id
      Team.update({ id: teamInfo.id }, { id: team.id });
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
          DbTeam.jacketNr = team.jacketNr;

          // Attempt to save the team.
          await DbTeam.save();
        }
      }
      server.log.info(`Registered ${this.newTeams} new teams and updated ${this.updatedTeams} teams`);
    } catch (error) {
      server.log.error(error);
    }
  }

  // Uses a arrow function to properly handle the `this` context in the interval function
  public fetch = async () => {
    server.log.info(`Fetching teams from telraam at ${config.TELRAAM_ENDPOINT}`);
    try {
      const response = await AxiosService.getInstance().request<TelraamTeam[]>("get", `/team`, {
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
      TelraamLapService.getInstance().flush();
    } catch (error: any) {
      return;
    }
  }
}
