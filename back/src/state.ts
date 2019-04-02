import winston from "winston";
import { Sequelize } from "sequelize-typescript";
import { SequelizeConfig } from "sequelize-typescript/lib/types/SequelizeConfig";

export interface StateOptions {
  logger: winston.Logger;
  teams: string[];
  config: StateConfig;
}

export interface StateConfig {
  minSecondsBetweenBumps: number // in seconds;
  dbConfig: SequelizeConfig;
}

export class State {
  private logger: winston.Logger;
  private teams: Team[];
  private config: StateConfig;
  private db: Sequelize;

  constructor(options: StateOptions) {
    const { logger, teams, config } = options;
    this.logger = logger;
    this.config = config;
    this.teams = teams.map((name, id) => ({
      id,
      name,
      status: {
        laps: 0,
        unixTimeStampWhenBumpable: Date.now(),
      }
    }));

    this.db = new Sequelize({
      modelPaths: [
        __dirname + '/models/**/*.model.ts',
      ],
      ...this.config.dbConfig
    });
  }

  /**
   * Bump the lap count for a team (do +1).
   * 
   * @param teamId the id of the team you want to bump the lap count for
   */
  public bumpLapCount(teamId: number): Status {
    // Check if actual team
    if (teamId < this.teams.length) {
      const team = this.teams[teamId];
      this.logger.info(`[state] Received bump request for ${this.formatTeam(team)}`);

      // Update team state
      team.status.laps += 1;
      team.status.unixTimeStampWhenBumpable = Date.now() + this.config.minSecondsBetweenBumps * 1000;

      // Return new status 
      this.logger.info(`[state] ${this.formatTeam(team)} increased to lap count ${team.status.laps} (next possible in ${team.status.unixTimeStampWhenBumpable})`);
      return JSON.parse(JSON.stringify(team.status));
    } else {
      this.logger.error(`[state] Received bump request for non-existing team ${teamId}`);
      throw new NonExistingTeamError(teamId);
    }
  }

  /**
   * Dump the status of all teams
   */
  public getTeams(): Team[] {
    return JSON.parse(JSON.stringify(this.teams));
  }

  /**
   * Format a team for logging messages
   * @param team the team to format
   */
  private formatTeam(team: Team): string {
    return `${team.name} (${team.id})`;
  }
}

export interface Team {
  id: number,
  name: string,
  status: Status;
}

export interface Status {
  laps: number,
  unixTimeStampWhenBumpable: number;
}

export class NonExistingTeamError extends Error {
  constructor(teamId: number) {
    super(`Team ${teamId} does not exist.`)
  }
}