import { StoredLap } from "../types/models/queue.model";
import { getLaps, registerNewLap } from "./db";
import { socket } from "./socket";

let isDirty = false;

export const storeLap = async (lap: StoredLap) => {
  isDirty = true;
  registerNewLap(lap);
};

socket.on("queueLapPush", async (data: { timestamp: number }) => {
  if (!isDirty) return;
  isDirty = false;
  const laps = await getLaps();
  const filteredLaps = laps.filter(l => l.timestamp >= data.timestamp);
  socket.emit("pushLaps", filteredLaps);
});
