import { io } from "socket.io-client";
import config from "../config";
import { useWebsocketStore } from "../stores/websocket.store";
import { toast } from "./toast";

// TODO: integrate authentication in socket.io creation
export const socket = io(`http://${import.meta.env.VITE_SERVER_IP}:${import.meta.env.VITE_SERVER_PORT ?? 3000}`);

const renewToken = async (): Promise<string> => {
  const res = await config.axios.get<{ token: string }>("auth");
  console.info(`Old token: ${localStorage.getItem("auth")}`);
  localStorage.setItem("auth", res.data.token);
  return res.data.token as string;
};

export const authToServer = async (tries?: number) => {
  // Prevent loop
  tries = (tries ?? 0) + 1;
  if (tries == 4) {
    toast({
      message: `Failed to authenticate to server\nClear your session storage and try again`,
      type: "is-warning",
    });
  }

  let authToken = localStorage.getItem("auth");
  if (!authToken) {
    authToken = await renewToken();
  }
  let { setToken } = useWebsocketStore();
  await new Promise<void>(res => {
    socket.emit(
      "authClient",
      {
        token: authToken,
      },
      async (isValid: boolean) => {
        if (!isValid) {
          toast({
            message: `Stored token seems invalid\nGenerating new token (attempt ${tries})`,
            type: "is-danger",
          });
          await renewToken();
          authToServer(tries);
          return;
        }
        setToken(authToken as string);
        res();
      }
    );
  });
};
