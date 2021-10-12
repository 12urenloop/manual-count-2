export default {
  // Server Port
  PORT: process.env.PORT || 3000,

  // Min lap difference in milliseconds between 2 laps.
  LAP_MIN_DIFFERENCE: process.env.LAP_MIN_INTERVAL || 30 * 1000,
};
