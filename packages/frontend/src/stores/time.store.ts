import { useAxios } from "@vueuse/integrations/useAxios";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { Time } from "../types/models/time.model";
import config from "../config";

export const useTimeStore = defineStore("time", () => {
  // Fetch the server time
  const timeQuery = useAxios<Time>("/time", config.axios);

  // Current time
  // Will be updated every second
  const currentTime = ref(Date.now());

  // Server time value
  const serverTime = computed(() => timeQuery.data.value?.timestamp || -1);

  // Server time offset value
  // This is the difference between the server time and the local time
  const serverTimeOffset = ref(0);

  // Current time value
  // Determined by the client's current time and the server time
  const clientTime = computed(() =>
    serverTime.value === -1 ? currentTime.value : currentTime.value - serverTimeOffset.value
  );

  // Update the current time every second
  setInterval(() => {
    currentTime.value = Date.now();
  }, 1000);

  // Set the server time offset when the time query resolves
  watch(
    () => timeQuery.isFinished,
    (finished) => {
      if (finished) {
        serverTimeOffset.value = new Date().getTime() - serverTime.value;
      }
    }
  );

  return {
    timeQuery,
    serverTime,
    serverTimeOffset,
    clientTime,
  };
});
