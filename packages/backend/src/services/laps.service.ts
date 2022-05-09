import { Lap } from "../models/lap.model";
import { AxiosService } from "./axios.service";
import { server } from "../main";
import authController from "../controllers/auth.controller";
import authService from "./auth.service";
import { StoredTeam } from "../types/team.types";
import { timeStamp } from "console";
import { Between } from "typeorm";
import config from "../config";
import { Team } from "../models/team.model";

export class LapService {
  // region SingleTon
  private static Instance: LapService;

  public static getInstance(): LapService {
    if (!this.Instance) {
      this.Instance = new LapService();
    }
    return this.Instance;
  }

  // endregion
  protected createInstance(): LapService {
    return new LapService();
  }

  private queue: Lap[];
  /**
   * Map that tracks the highest time of all laps of a certain client
   */
  private clientTimes: Map<string, number>;
  private lock: boolean;

  constructor() {
    this.clientTimes = new Map();
    this.queue = [];
    this.lock = false;
  }

  private async pushToTelraam(lap: Lap): Promise<boolean> {
    try {
      const response = await AxiosService.getInstance().request("post", "/lap", {
        teamId: lap.team.id,
        lapSourceId: 2,
        timestamp: lap.timestamp,
      });
      if (response.status !== 200) {
        server.log.error(`Lap ${lap.id} could not be pushed to telraam, status: ${response.status}`);
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
    server.log.debug(`Queue is not empty, trying to push ${this.queue.length} laps to telraam`);
    // Try to push first in this.queue
    const first = this.queue.at(0);
    const isSuccess = await this.pushToTelraam(first as Lap);
    // If success, remove first, push others
    if (!isSuccess) return;
    server.log.info(`Telraam online, pushing ${this.queue.length} laps to telraam`);
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
    server.log.debug(`Lap ${lap.id} pushed to telraam: ${isSuccess}`);
    if (!isSuccess) {
      // If not success, add to queue
      this.queue.push(lap);
    }
  }

  public async syncMissingLaps() {
    const laps = await AxiosService.getInstance().request<any[]>("get", "/lap", {
      source: 2,
    });
    if (laps.status !== 200) {
      server.log.error(`Could not get laps from telraam, status: ${laps.status}`);
      return;
    }
    const lapsFromTelraam = laps.data;
    const lapsFromDatabase = await Lap.find({
      relations: ["team"],
    });
    const lapsToPush = lapsFromDatabase.filter(
      l => !lapsFromTelraam.find(tl => tl.teamId == l.team.id && tl.timestamp == l.timestamp)
    );
    for (const lap of lapsToPush) {
      await this.queueLap(lap);
    }
    server.log.info(`Found ${lapsToPush.length} laps to push to telraam`);
  }

  public async doLapRequest() {
    const clients = authService.getConnectedClients();
    clients.forEach((token, socket) => {
      server.io.in(socket).emit("queueLapPush", {
        timestamp: this.clientTimes.get(token) ?? 0,
      });
    });
  }

  public async handleLapPush(client: string, laps: StoredTeam[]) {
    let storedTimeStamp = this.clientTimes.get(client) ?? 0;
    laps.forEach(async lap => {
      if (lap.timestamp > storedTimeStamp) {
        storedTimeStamp = lap.timestamp;
      }
      // Check if no lap has not interfering lap that is VITE_LAP_MIN_INTERVAL seconds before or after
      // if no interfering lap --> store
      const storedLap = await Lap.findOne({
        where: {
          team: {
            id: lap.teamId,
          },
          timestamp: Between(lap.timestamp - config.LAP_MIN_DIFFERENCE, lap.timestamp + config.LAP_MIN_DIFFERENCE),
        },
        relations: ["team"],
      });
      if (storedLap) return;
      // Check if team with this id exists
      const team = await Team.findByIds([lap.teamId]);
      if (!team || !team[0]) return;
      // Lap timestamp is greater than current time
      if (lap.timestamp > Date.now()) return;
      const newLap = new Lap();
      newLap.team = team[0];
      newLap.timestamp = lap.timestamp;

      await newLap.save();
      server.log.info(`Lap ${newLap.id} pushed to MC database`);
    });
    this.clientTimes.set(client, storedTimeStamp);
  }
}
