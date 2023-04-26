import { Between, Equal } from "typeorm";
import { server } from "../main";
import { Lap } from "../models/lap.model";
import { Team } from "../models/team.model";
import config from "../config";
import { TelraamLapService } from "./telraamlaps.service";

class LapStoreService {
  private queue: Laps.QueuedLap[] = []
  private busy = false;
  private async pushLap() {
    const lapInfo = this.queue.shift();
    if (!lapInfo) return;
    const team = await Team.findOneBy({ id: lapInfo.teamId });
    if (!team) {
      server.log.warn(`A lap was scheduled for an unknown teamId: ${lapInfo.teamId}`)
      return;
    }

    // Make sure the date difference between the last lap and the new one is
    // at lease the LAP_MIN_DIFFERENCE value.
    const interferingLap = await this.getInterfereringDBLap(team, lapInfo.timestamp);
    if (interferingLap) {
      server.log.info(`Skipped lap for ${lapInfo.teamId} because there was another lap counted in the diff interval`);
      return;
    }

    // Create a new lap and append it to the team.
    const lap = new Lap();
    lap.team = team;
    lap.timestamp = lapInfo.timestamp;

    // Attempt to save the lap
    await lap.save();

    TelraamLapService.getInstance().queueLap(lap);
  }

  private async flushQueue() {
    if (this.busy) return;
    this.busy = true;
    while (this.queue.length !== 0) {
      await this.pushLap();
    }
    this.busy = false;
  }

  getInterfereringDBLap(team: Team, timestamp: number) {
    return Lap.findOne({
      where: {
        team: Equal(team),
        timestamp: Between(timestamp - config.LAP_MIN_DIFFERENCE, timestamp + config.LAP_MIN_DIFFERENCE)
      }
    });
  }

  getInterfereringQueueLap(team: Team, timestamp: number) {
    return this.queue.find(l => l.teamId === team.id && Math.abs(l.timestamp - timestamp) < config.LAP_MIN_DIFFERENCE);
  }

  scheduleLap(lap: Laps.QueuedLap) {
    this.queue.push(lap);
    this.flushQueue();
  }
}

export const lapStoreService = new LapStoreService();
