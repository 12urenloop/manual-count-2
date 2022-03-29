import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { socket } from "@/src/helpers/socket";

export const useTimeStore = defineStore("time", () => {
  // Current time
  // Will be updated every second
  const currentTime = ref(Date.now());

  // Server time value
  const serverTime = ref(-1);

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

  socket.on('time', (data: { timestamp: number }) => {
    serverTime.value = data.timestamp;
    serverTimeOffset.value = new Date().getTime() - serverTime.value;
  });

  return {
    serverTime,
    serverTimeOffset,
    clientTime,
  };
});
