import { defineStore } from "pinia";
import { useQueueStore } from "@/src/stores/queue.store";
import { reactive, ref } from "vue";
import { toast } from "@/src/helpers/toast";
import { socket } from "@/src/helpers/socket";

export const useWebsocketStore = defineStore("websocket", () => {
  const queueStore = useQueueStore();

  const token = ref<string>('');
  const backend = reactive<ServerStatus>({
    online: false,
    // Interval that is running to up the offlineTime
    offlineTimer: undefined,
    offlineTime: 0,
  });

  const telraam = reactive<ServerStatus>({
    online: false,
    offlineTimer: undefined,
    offlineTime: 0,
  });

  const setTelraamStatus = (status: boolean) => {
    if (status) {
      if (telraam.offlineTimer) {
        clearInterval(telraam.offlineTimer);
      }
      telraam.online = true;
      telraam.offlineTime = 0;
      toast({
        message: "Connected to Telraam",
        type: "is-success",
      });
    } else {
      telraam.online = false;
      telraam.offlineTime = 0;
      if (telraam.offlineTimer) {
        clearInterval(telraam.offlineTimer);
      }
      telraam.offlineTimer = setInterval(() => {
        telraam.offlineTime++;
      }, 1000);
      toast({
        message: "Connection lost to Telraam",
        type: "is-danger",
      });
    }
  };

  const setBackendStatus = (status: boolean) => {
    if (status) {
      if (backend.offlineTimer) {
        clearInterval(backend.offlineTimer);
      }
      backend.online = true;
      backend.offlineTime = 0;
      toast({
        message: "Connected to backend",
        type: "is-success",
      });
    } else {
      backend.online = false;
      backend.offlineTime = 0;
      if (backend.offlineTimer) {
        clearInterval(backend.offlineTimer);
      }
      backend.offlineTimer = setInterval(() => {
        backend.offlineTime++;
      }, 1000);
      toast({
        message: "Connection lost to backend",
        type: "is-danger",
      });
    }
  };
  
  const setToken = (authToken: string) => {
    token.value = authToken
  }

  const getToken = (): string => {
    return token.value;
  }

  socket.on("connect", () => {
    socket.emit("telraamStatus");
    queueStore.flushQueue();
    setBackendStatus(true);
  });

  socket.on("disconnect", () => {
    setBackendStatus(false);
    setTelraamStatus(false);
  });

  socket.on("telraamStatus", setTelraamStatus);
  return {
    backend,
    telraam,
    token,
    getToken,
    setToken,
  };
});
