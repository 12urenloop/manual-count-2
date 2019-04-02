import express from "express";
import winston from "winston";

import { State } from './state';
import { TransformableInfo } from "logform";

function main() {
  const app = express();
  const port = 3000;
  const logDirectory = './logs';

  const teams = [
    'team01_vtk',
    'team02_hilok',
    'team03_vek',
    'team04_wvk'
  ];

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
        filename: `${logDirectory}/error.log`,
        level: 'error',
      }),
      new winston.transports.File({
        filename: `${logDirectory}/warning.log`,
        level: 'warning',
      }),
      new winston.transports.File({
        filename: `${logDirectory}/all.log`,
        level: 'debug',
      }),
      new winston.transports.Console({
        level: 'debug',
      })
    ],
  });

  const state = new State({ logger, teams });

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

  app.get('/teams', async (req, res, next) => {
    try {
      const teams = await state.getTeams();
      res.send({ teams });
    } catch (err) {
      next(err);
    }
  });

  app.post('/teams/:id', async (req, res, next) => {
    try {
      const teamId = parseInt(req.params.id, 10);
      const newLapCount = await state.bumpLapCount(teamId);
      const teams = await state.getTeams();
      res.send({ teams, newLapCount });
    } catch (err) {
      next(err);
    }
  });

  app.listen(port, () => console.log(`Server running on http://localhost:${port}!`));
}



main();