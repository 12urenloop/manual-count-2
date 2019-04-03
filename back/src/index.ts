import express from "express";
import winston from "winston";

import { SequelizeConfig } from 'sequelize-typescript/lib/types/SequelizeConfig';
import { TransformableInfo } from "logform";

import { State, StateConfig, Status, TeamResult } from './state';

type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'error' | 'crit' | 'alert' | 'emerg';

interface Config {
  port: number;
  logDirectory: string;
  seedTeams: string[];
  minSecondsBetweenBumps: number;
  consoleLogLevel: LogLevel;
  dbConfig: SequelizeConfig;
}

const defaultConfig: Config = {
  port: 3000,
  logDirectory: './logs',
  minSecondsBetweenBumps: 15,
  consoleLogLevel: 'debug',
  seedTeams: [
    'team01_vtk',
    'team02_hilok',
    'team03_vek',
    'team04_wvk'
  ],
  dbConfig: {
    'dialect': 'sqlite',
    'storage': './database.sqlite3',
  }
}

function main() {
  const app = express();

  // TODO Read external config
  const config: Config = defaultConfig;

  const lineFormat = (info: TransformableInfo) =>
    `${info.metadata.timestamp} ${info.level} ${info.message}`;

  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:SS' }),
      winston.format.metadata(),
      winston.format.printf(lineFormat),
    ),
    transports: [
      new winston.transports.File({
        filename: `${config.logDirectory}/error.log`,
        level: 'error',
      }),
      new winston.transports.File({
        filename: `${config.logDirectory}/warning.log`,
        level: 'warning',
      }),
      new winston.transports.File({
        filename: `${config.logDirectory}/all.log`,
        level: 'debug',
      }),
      new winston.transports.Console({
        level: 'debug',
      })
    ],
  });

  const { minSecondsBetweenBumps, dbConfig } = config;
  const stateConfig: StateConfig = { minSecondsBetweenBumps, dbConfig };
  const state = new State({
    logger,
    teams: config.seedTeams,
    config: stateConfig,
  });

  // Middleware for loggin all requests
  app.use((req, _res, next) => {
    logger.info(`[express.request] ${req.method} ${req.originalUrl}`);
    next();
  });

  app.get('/', async (req, res, next) => {
    try {
      res.send("This is Count Manuel speaking!");
    } catch (err) {
      next(err);
    }
  });

  app.post('/teams/seed', async (req, res, next) => {
    try {
      const teams = await state.addTeams(config.seedTeams);
      res.send(teams);
    } catch (err) {
      next(err);
    }
  });

  // Get status for all teams 
  app.get('/teams', async (req, res, next) => {
    try {
      const teams: TeamResult[] = await state.getTeams();
      res.send({ teams });
    } catch (err) {
      next(err);
    }
  });

  // End point for bumping the lap count of a team
  app.post('/teams/:id/bump', async (req, res, next) => {
    try {
      const teamId = parseInt(req.params.id, 10);
      const newStatus: Status = await state.bumpLapCount(teamId);
      const teams: TeamResult[] = await state.getTeams();
      res.send({ teams, newLapCount: newStatus });
    } catch (err) {
      next(err);
    }
  });

  // Let's spawn this baby
  app.listen(
    config.port,
    () => console.log(`Server running on http://localhost:${config.port}!`)
  );
}



main();