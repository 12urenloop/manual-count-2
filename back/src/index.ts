import express from "express";
import winston from "winston";

import { State, StateConfig, Status, Team } from './state';
import { TransformableInfo } from "logform";

type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'error' | 'crit' | 'alert' | 'emerg';

interface Config {
  port: number;
  logDirectory: string;
  teams: string[];
  minSecondsBetweenBumps: number;
  consoleLogLevel: LogLevel;
}

const defaultConfig: Config = {
  port: 3000,
  logDirectory: './logs',
  minSecondsBetweenBumps: 15,
  consoleLogLevel: 'debug',
  teams: [
    'team01_vtk',
    'team02_hilok',
    'team03_vek',
    'team04_wvk'
  ],
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

  const stateConfig: StateConfig = { minSecondsBetweenBumps: 10 };
  const state = new State({
    logger,
    teams: config.teams,
    config: stateConfig,
  });

  // Middleware for loggin all requests
  app.use((req, _res, next) => {
    logger.info(`[express.request] ${req.method} ${req.originalUrl}`);
    next();
  });

  // 
  app.get('/', async (req, res, next) => {
    try {
      res.send("This is Count Manuel speaking!");
    } catch (err) {
      next(err);
    }
  });

  // Get status for all teams 
  app.get('/teams', async (req, res, next) => {
    try {
      const teams: Team[] = await state.getTeams();
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
      const teams: Team[] = await state.getTeams();
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