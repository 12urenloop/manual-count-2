import { Lap } from "../models/lap.model";
import { AxiosService } from "./axios.service";
import { server } from "../main";

export class TelraamLapService {
  // region SingleTon
  private static Instance: TelraamLapService;

  public static getInstance(): TelraamLapService {
    if (!this.Instance) {
      this.Instance = new TelraamLapService();
    }
    return this.Instance;
  }

  // endregion
  protected createInstance(): TelraamLapService {
    return new TelraamLapService();
  }

  private queue: Lap[];
  private lock: boolean;

  constructor() {
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
}
