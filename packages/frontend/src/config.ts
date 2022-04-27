import axios from "axios";

export default {
  // Default Axios Configuration
  axios: axios.create({
    baseURL: `http://${import.meta.env.VITE_SERVER_IP}:${import.meta.env.VITE_SERVER_PORT ?? 3000}`,
    headers: {
      "Content-Type": "application/json",
    },
  }),

  // Teams configuration
  teams: {
    // Delay (in milliseconds) since last lap to show the lap update warning
    delayWarning: 120 * 1000,
    minInterval: Number(import.meta.env.VITE_LAP_MIN_INTERVAL) ?? 30000,
    minIntervalSec: (Number(import.meta.env.VITE_LAP_MIN_INTERVAL) ?? 30000) / 1000,
  },
};
