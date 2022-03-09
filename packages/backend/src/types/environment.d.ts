import { ConfigMode } from "./config.types";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * The port the server should listen on.
       * @default 3000
       */
      PORT: string;
      /**
       * The minimum difference between 2 laps for a team to be considered valid.
       * @default 30000
       */
      LAP_MIN_DIFFERENCE: string;
      /**
       * The endpoint where we can connect to telraam.
       * @default 'localhost:8080'
       */
      TELRAAM_ENDPOINT: string;
      /**
       * Time between fetch for teams in telraam in ms.
       */
      TEAM_FETCH_INTERVAL: string;
      MODE: ConfigMode;
    }
  }
}
export {};
