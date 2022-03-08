import { Config, ConfigMode } from "./types/config.types";

const modes = ["development", "production"];

const config: Config = {
  // Server Port
  PORT: Number(process.env.PORT) || 3000,

  // Min lap difference in milliseconds between 2 laps.
  LAP_MIN_DIFFERENCE: Number(process.env.LAP_MIN_INTERVAL) || 30 * 1000,

  // Endpoint for the API
  TELRAAM_ENDPOINT: process.env.TELRAAM_ENDPOINT || "localhost:8080",

  MODE: modes.includes(process.env.MODE ?? "") ? process.env.MODE as ConfigMode : "production",

  // Amount of time in milliseconds betweem each check for teams in telraam
  TEAM_FETCH_INTERVAL: Number(process.env.TEAM_FETCH_INTERVAL) || 60 * 1000,
};
export default config;