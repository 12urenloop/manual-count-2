import axios from "axios";

export default {
  // Default Axios Configuration
  axios: axios.create({
    baseURL: `http://${import.meta.env.VITE_SERVER_IP}:3000`,
    headers: {
      "Content-Type": "application/json",
    },
  }),

  // Teams configuration
  teams: {
    // Delay (in milliseconds) since last lap to show the lap update warning
    delayWarning: 120 * 1000,
  },
};
