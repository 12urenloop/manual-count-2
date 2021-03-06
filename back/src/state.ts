import winston from "winston";

import { Sequelize } from "sequelize-typescript";
import { SequelizeConfig } from "sequelize-typescript/lib/types/SequelizeConfig";

import { Team } from "./models/Team.model";
import { BumpRequest } from "./models/BumpRequest.model";

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
  private delay: number;
  private boxxyUpdate: boolean;

  constructor(options: StateOptions) {
    const { logger, config } = options;
    this.logger = logger;
    this.config = config;
    this.delay = config.minSecondsBetweenBumps * 1000;
    this.boxxyUpdate = false;

    // Set up database
    this.db = new Sequelize({
      operatorsAliases: false,
      ...this.config.dbConfig
    });
  }

  initialize() {
    this.db.addModels([Team, BumpRequest]);
  }

  /**
   * Bump the lap count for a team (do +1).
   * 
   * @param teamId the id of the team you want to bump the lap count for
   */
  public async getBoxxyUpdate(): Promise<boolean> {
    return this.boxxyUpdate
  }
  public async setBoxxyUpdate(flag: boolean): Promise<void> {
    this.boxxyUpdate = flag;
  }
  public async bumpLapCount(teamId: number, timestamp: number): Promise<Status> {
    let team = await Team.findByPrimary(teamId);
    if (!team) {
      this.logger.error(`[state] Received bump request for non-existing team ${teamId}`);
      return Promise.reject(new NonExistingTeamError(teamId));
    }

    // Register the request
    this.logger.info(`[state] Received bump request for ${this.formatTeam(team)}`);
    await BumpRequest.create(new BumpRequest({ teamId }))

    // If the bump is too early, we don't update the state
    if (timestamp < team.lastBumpAt + this.delay) {
      return this.toStatus(team);
    }

    team = await team.update({
      'lapCount': team.lapCount + 1,
      'lastBumpAt': timestamp,
    });

    this.logger.info(`[state] ${this.formatTeam(team)} increased to ${team.lapCount}`);
    return this.toStatus(team);
  }

  /**
   * Dump the status of all teams
   */
  public async getTeams(): Promise<TeamResult[]> {
    const teams = await Team.findAll({
      order: [
        ['id', 'ASC']
      ]
    });
    return teams.map((team) => {
      const { id, name } = team;
      return { id, name, status: this.toStatus(team) };
    });
  }

  private toStatus(team: Team): Status {
    const { lapCount, lastBumpAt } = team;
    return {
      lapCount,
      lastBumpAt,
      unixTimeStampWhenBumpable: lastBumpAt + this.delay,
    }
  }

  /**
   * Format a team for logging messages
   * @param team the team to format
   */
  private formatTeam(team: Team): string {
    return `${team.name} (${team.id})`;
  }
}

export interface TeamResult {
  id: number,
  name: string,
  status: Status;
}

export interface Status {
  lapCount: number,
  lastBumpAt: number,
  unixTimeStampWhenBumpable: number;
}

export class NonExistingTeamError extends Error {
  constructor(teamId: number) {
    super(`Team ${teamId} does not exist.`)
  }
}
