import { FastifyInstance } from "fastify";
import { Lap } from "../models/lap.model";
import { AxiosService } from "./axios.service";

export class LapService {
  public static instance: LapService;

  private server: FastifyInstance;
  private queue: Lap[];
  private lock: boolean;

  constructor(server: FastifyInstance) {
    this.server = server;
    this.queue = [];
    this.lock = false;
    LapService.instance = this;
  }

  private async pushToTelraam(lap: Lap): Promise<boolean> {
    try {
      const response = await AxiosService.instance.request("post", "/lap", {
        teamId: lap.team.id,
        lapSourceId: 2,
        timestamp: lap.timestamp
      });
      if (response.status !== 200) {
        this.server.log.error(
          `Lap ${lap.id} could not be pushed to telraam, status: ${response.status}`
        );
        return false;
      }
      return true;
    } catch (e: any) {
      return false;
    }
  }

  public async flush() {
    if (this.queue.length === 0 || this.lock) {
      return;
    }
    this.lock = true;
    this.server.log.debug(`Queue is not empty, trying to push ${this.queue.length} laps to telraam`);
    // Try to push first in this.queue
    const first = this.queue.at(0);
    const isSuccess = await this.pushToTelraam(first as Lap);
    // If success, remove first, push others
    if (!isSuccess) return;
    this.server.log.info(`Telraam online, pushing ${this.queue.length} laps to telraam`);
    this.queue.shift();
    const lapsToRemove: Lap[] = [];
    for (const qLap of this.queue) {
      // We check if it actually pushed, Telraam could potentially go down while we are pushing
      if (await this.pushToTelraam(qLap)) {
        lapsToRemove.push(qLap);
      }
    }
    this.queue = this.queue.filter(qLap => !lapsToRemove.includes(qLap));
    this.lock = false;
  }

  public async queueLap(lap: Lap) {
    await this.flush();
    // Push new lap
    const isSuccess = await this.pushToTelraam(lap);
    this.server.log.debug(`Lap ${lap.id} pushed to telraam: ${isSuccess}`);
    if (!isSuccess) {
      // If not success, add to queue
      this.queue.push(lap);
    }
  }
}