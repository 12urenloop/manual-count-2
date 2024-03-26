import { defineStore, Store } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { StoredLap } from "@/src/types/models/queue.model";
import config from "@/src/config";

export const useQueueStore = defineStore("storage", () => {
  // Get localstorage
  const queuedLaps = useLocalStorage<StoredLap[]>("queuedLaps", [], {
    deep: true,
    listenToStorageChanges: true,
  });

  async function pushQueuedLap(lap: StoredLap) {
    try {
      const response = await config.axios.post<BasePostResponse>(
        `/teams/${lap.teamId}/laps`,
        {
          timestamp: lap.timestamp,
        },
        {
          method: "POST",
        }
      );
      return response.status === 200;
    } catch (e) {
      return false;
    }
  }

  async function flushQueue() {
    const cutoff_time = new Date().setDate(new Date().getDate() - 30);
    while (queuedLaps.value.length > 0 && queuedLaps.value.at(0)!.timestamp < cutoff_time) {
      console.warn("Queued lap is too old, discarding it");
      queuedLaps.value.shift();
    }
    if (queuedLaps.value.length > 0) {
      // Get first element
      const queuedLap = queuedLaps.value.at(0);
      const isSuccess = pushQueuedLap(queuedLap as StoredLap);
      if (!isSuccess) {
        console.info(`Backend still offline, waiting for next flush attempt`);
      }
      queuedLaps.value.shift();
      const lapsToRemove: StoredLap[] = [];
      for (const lap of queuedLaps.value) {
        if (await pushQueuedLap(lap)) {
          lapsToRemove.push(lap);
        }
      }
      console.log(
        `Flushed ${lapsToRemove.length + 1} to backend, ${
          queuedLaps.value.length - lapsToRemove.length
        } are still in the queue`
      );
      queuedLaps.value = queuedLaps.value.filter(l => !lapsToRemove.includes(l));
    }
  }

  function addToQueue(lap: StoredLap) {
    queuedLaps.value.push(lap);
  }

  flushQueue();

  return {
    queuedLaps,
    flushQueue,
    addToQueue,
  };
});
