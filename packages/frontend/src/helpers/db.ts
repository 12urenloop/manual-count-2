import localForage from "localforage";
import { StoredLap } from "../types/models/queue.model";
import { toast } from "./toast";

export const lapsDB = localForage.createInstance({
  name: "12ul_emmanualcount_laps",
  driver: localForage.INDEXEDDB,
  // Bump this to create a new DB
  version: 1,
});

export const initDB = async (): Promise<void> => {
  try {
    await lapsDB.ready();
  } catch (e: any) {
    console.error(e);
    toast({
      message: "There was an error while initializing indexedDB",
      type: "is-danger",
    });
  }
};

export const getLaps = async (): Promise<StoredLap[]> => {
  try {
    const laps = await lapsDB.getItem<StoredLap[]>("laps");
    return laps ?? [];
  } catch (e: any) {
    console.error(e);
    toast({
      message: "Could not fetch laps from indexedDB",
      type: "is-danger",
    });
  }
  return [];
};

export const registerNewLap = async (lap: StoredLap) => {
  try {
    const storedLaps: StoredLap[] = JSON.parse(localStorage.getItem("toBeStoredLaps") ?? "[]");
    let laps = await getLaps();
    laps.push(lap, ...storedLaps);
    await lapsDB.setItem("laps", laps);
  } catch (e: any) {
    console.error(e);
    toast({
      message: "Could not push laps to indexedDB, Falling back to localstorage",
      type: "is-danger",
    });
    const storedLaps: StoredLap[] = JSON.parse(localStorage.getItem("toBeStoredLaps") ?? "[]");
    storedLaps.push(lap);
    localStorage.setItem("toBeStoredLaps", JSON.stringify(storedLaps));
  }
};
