export type ConfigMode = "development" | "production";

export interface Config {
  /**
   * The port the server should listen on.
   * @default 3000
   */
  PORT: number;
  /**
   * The minimum difference between 2 laps for a team to be considered valid.
   * @default 30000
   */
  LAP_MIN_DIFFERENCE: number;
  /**
   * The endpoint where we can connect to telraam.
   * @default 'localhost:8080'
   */
  TELRAAM_ENDPOINT: string;
  /**
   * Time between fetch for teams in telraam in ms.
   */
  TEAM_FETCH_INTERVAL: number;
  /**
   * Time between requests to the frontend to send newly registered laps
   */
  LAP_FETCH_INTERVAL: number;
  MODE: ConfigMode;
}
