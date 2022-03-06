import { Lap } from "../models/lap.model";
import { FastifyLoggerInstance } from "fastify/types/logger";
import { server } from "../main";
import { axiosInstance } from "./axios.service";

/**
 * Laps that can not be pushed to telraam (because it down) will be added to this list
 * These will be pushed before trying to push a newer lap
 */
let queue: Lap[] = [];
let lockQueue: boolean = false;
let logger: FastifyLoggerInstance = server?.log;

const pushToTelraam = async (lap: Lap): Promise<boolean> => {
  try {
    const response = await axiosInstance.post("/lap", {
      teamId: lap.team.id,
      lapSourceId: 2,
      timestamp: lap.timestamp
    });
    if (response.status !== 200) {
      logger.error(
        `Lap ${lap.id} could not be pushed to telraam, status: ${response.status}`
      );
      return false;
    }
    return true;
  } catch (e: any) {
    if (e.response) {
      // The request was made and the server responded with a status code
      logger.error(`Could not fetch teams from Telraam but connection was made: ${e.response.status}: ${e.response.statusText}`);
      return false;
    }
    if (e.request) {
      logger.error(`Could not fetch teams from Telraam, timed out after: ${e.config.timeout / 1000}s`);
      logger.error(`Did you set the correct TELRAAM_ENDPOINT in .env?`);
      return false;
      // The request was made but no response was received
    }
    logger.error(e);
    return false;
  }
};

export const flushQueue = async () => {
  if (queue.length === 0) {
    return;
  }
  lockQueue = true;
  logger.debug(`Queue is not empty, trying to push ${queue.length} laps to telraam`);
  // Try to push first in queue
  const first = queue.at(0);
  const isSuccess = await pushToTelraam(first as Lap);
  // If success, remove first, push others
  if (!isSuccess) return;
  logger.info(`Telraam online, pushing ${queue.length} laps to telraam`);
  queue.shift();
  const lapsToRemove: Lap[] = [];
  for (const qLap of queue) {
    // We check if it actually pushed, Telraam could potentially go down while we are pushing
    if (await pushToTelraam(qLap)) {
      lapsToRemove.push(qLap);
    }
  }
  queue = queue.filter(qLap => !lapsToRemove.includes(qLap));
  lockQueue = false;
};

export const queueLapToTelraam = async (lap: Lap) => {
  await flushQueue();
  // Push new lap
  const isSuccess = await pushToTelraam(lap);
  logger.debug(`Lap ${lap.id} pushed to telraam: ${isSuccess}`);
  if (!isSuccess) {
    // If not success, add to queue
    queue.push(lap);
  }
};