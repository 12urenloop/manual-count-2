import { io } from "socket.io-client";
import config from '../config';
import { useWebsocketStore } from "../stores/websocket.store";
import { toast } from "./toast";

// TODO: integrate authentication in socket.io creation
export const socket = io(`http://${import.meta.env.VITE_SERVER_IP}:3000`);

export const authToServer = async () => {
  let authToken = localStorage.getItem('auth');
  if (!authToken) {
    // Send request to get new token
    const res = await config.axios.get<{token:string}>('auth');
    localStorage.setItem('auth', res.data.token)
  }
  let { setToken } = useWebsocketStore();
  await new Promise<void>(res => {
    socket.emit('authClient', {
      token: authToken
    }, (isValid: boolean) => {
      if (!isValid) {
        toast({
          message: 'Couldn\'t authenticate to server',
          type: 'is-danger',
        })
      }
      setToken(authToken as string);
      res();
    })
  })
}