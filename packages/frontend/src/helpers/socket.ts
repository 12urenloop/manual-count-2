import { io } from "socket.io-client";

export const socket = io(`http://${import.meta.env.VITE_SERVER_IP}:3000`);