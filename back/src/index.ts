import express from "express";
import winston from "winston";

import { TransformableInfo } from "logform";

import { State, StateConfig, Status, TeamResult } from './state';
import { config } from './config';

async function main() {
  const app = express();

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
    config: stateConfig,
  });
  await state.initialize();

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
      res.send(newStatus);
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



main()
  .then(() => "Exited succeselly!")
  .catch((err) => console.error(err));