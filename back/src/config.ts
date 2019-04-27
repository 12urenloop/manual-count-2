import { SequelizeConfig } from "sequelize-typescript/lib/types/SequelizeConfig";

type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'error' | 'crit' | 'alert' | 'emerg';

interface Config {
  port: number;
  logDirectory: string;
  minSecondsBetweenBumps: number;
  consoleLogLevel: LogLevel;
  dbConfig: SequelizeConfig;
}

export const config: Config = {
  port: 3000,
  logDirectory: './logs',
  minSecondsBetweenBumps: 15,
  consoleLogLevel: 'debug',
  dbConfig: {
    'dialect': 'sqlite',
    'storage': './database.sqlite3',
    'logging': false,
  }
}