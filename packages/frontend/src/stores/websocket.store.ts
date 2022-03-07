import { defineStore } from "pinia";
import { toast as baseToast, Options as ToastOptions } from "bulma-toast";
import { io } from "socket.io-client";
import { useTeamsStore } from "@/src/stores/teams.store";
import { useQueueStore } from "@/src/stores/queue.store";

const toast = (options: ToastOptions) => baseToast({
  animate: { in: "slideInRight", out: "slideOutRight" },
  position: "bottom-right",
  dismissible: true,
  duration: 3000,
  opacity: 0.8,
  ...options
});

export const useWebsocketStore = defineStore("websocket", () => {
  const teamsStore = useTeamsStore();
  const queueStore = useQueueStore();

  const socket = io("http://localhost:3000");

  socket.on("connect", () => {
    toast({
      message: "Connected to backend",
      type: "is-success"
    });
    queueStore.flushQueue();
  });

  socket.on("disconnect", () => {
    toast({
      message: "Disconnected from backend",
      type: "is-danger"
    });
  });

  socket.on("updateTeam", (team: any) => {
    teamsStore.addLapFromWS(team.teamId);
  });
});