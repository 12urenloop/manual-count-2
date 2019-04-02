import winston from "winston";

export interface StateOptions {
  logger: winston.Logger;
  teams: string[];
}

export class State {
  private logger: winston.Logger;
  private teams: Team[];

  constructor(options: StateOptions) {
    const { logger, teams } = options;
    this.logger = logger;
    this.teams = teams.map((name, id) => ({
      id,
      name,
      status: {
        laps: 0,
        blocked: false,
      }
    }))
  }

  public bumpLapCount(teamId: number): number {
    if (teamId < this.teams.length) {
      const team = this.teams[teamId];
      team.status.laps += 1;
      const current = team.status.laps;
      this.logger.info(`[state] ${team.name} (${teamId}) increased to lap count ${current}`);
      return current;
    } else {
      throw new NonExistingTeamError(teamId);
    }
  }

  public getTeams(): Team[] {
    return JSON.parse(JSON.stringify(this.teams));
  }

}

export interface Team {
  id: number,
  name: string,
  status: {
    laps: number,
  }
}

export class NonExistingTeamError extends Error {
  constructor(teamId: number) {
    super(`Team ${teamId} does not exist.`)
  }
}