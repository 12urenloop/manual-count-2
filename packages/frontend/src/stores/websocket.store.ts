import { defineStore } from "pinia";
import { io } from "socket.io-client";
import { useTeamsStore } from "@/src/stores/teams.store";
import { useQueueStore } from "@/src/stores/queue.store";
import { ref } from "vue";
import { toast } from "@/src/helpers/toast";

export const useWebsocketStore = defineStore("websocket", () => {
  const teamsStore = useTeamsStore();
  const queueStore = useQueueStore();

  const backendStatus = ref(false);
  const telraamStatus = ref(false);

  const socket = io("http://localhost:3000");

  socket.on("connect", () => {
    toast({
      message: "Connected to backend",
      type: "is-success",
    });
    socket.emit("telraamStatus");
    queueStore.flushQueue();
    backendStatus.value = true;
  });

  socket.on("disconnect", () => {
    toast({
      message: "Disconnected from backend",
      type: "is-danger",
    });
    backendStatus.value = false;
  });

  socket.on("updateTeam", (team: any) => {
    teamsStore.addLapFromWS(team.teamId);
  });

  socket.on("telraamStatus", (status: any) => {
    telraamStatus.value = status;
    if (status) {
      toast({
        message: "Connected to Telraam",
        type: "is-success",
      });
    } else {
      toast({
        message: "Connection lost to Telraam",
        type: "is-danger",
      });
    }
  });
  return {
    backendStatus,
    telraamStatus,
  };
});
