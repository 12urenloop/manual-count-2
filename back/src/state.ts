import winston from "winston";

import { Sequelize } from "sequelize-typescript";
import { SequelizeConfig } from "sequelize-typescript/lib/types/SequelizeConfig";

import { Team } from "../models/Team.model";
import { BumpRequest } from "../models/BumpRequest.model";

export interface StateOptions {
  logger: winston.Logger;
  config: StateConfig;
}

export interface StateConfig {
  minSecondsBetweenBumps: number // in seconds;
  dbConfig: SequelizeConfig;
}

export class State {
  private logger: winston.Logger;
  private config: StateConfig;
  private db: Sequelize;

  constructor(options: StateOptions) {
    const { logger, config } = options;
    this.logger = logger;
    this.config = config;

    // Set up database
    this.db = new Sequelize({
      modelPaths: [
        __dirname + '/models/**/*.model.ts',
      ],
      operatorsAliases: false,
      ...this.config.dbConfig
    });
    this.db.sync();
  }

  /**
   * Bump the lap count for a team (do +1).
   * 
   * @param teamId the id of the team you want to bump the lap count for
   */
  public async bumpLapCount(teamId: number): Promise<Status> {
    try {
      const team = await Team.findByPk(teamId);
      this.logger.info(`[state] Received bump request for ${this.formatTeam(team)}`);

    } catch (err) {
      return Promise.reject(new NonExistingTeamError(teamId));
    }

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


  public async addTeams(names: string[]): Promise<Team[]> {
    return Team.bulkCreate(names.map((name) => ({ name })));
  }

  /**
   * Dump the status of all teams
   */
  public async getTeams(): Promise<TeamResult[]> {
    const teams = await Team.findAll();
    return teams.map(({ id, name, lapCount, lastBumpAt }) => ({
      id,
      name,
      status: {
        laps: lapCount,
        unixTimeStampWhenBumpable: lastBumpAt + this.config.minSecondsBetweenBumps * 1000,
      }
    }));
  }

  /**
   * Format a team for logging messages
   * @param team the team to format
   */
  private formatTeam(team: Team): string {
    return `${team} (${team.id})`;
  }
}

export interface TeamResult {
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