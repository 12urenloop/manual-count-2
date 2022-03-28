declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      LAP_MIN_DIFFERENCE: string;
      TELRAAM_ENDPOINT: string;
      TEAM_FETCH_INTERVAL: string;
      LAP_FETCH_INTERVAL: string;
      MODE: string;
    }
  }
}
export {};
