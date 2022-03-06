import axios from "axios";
import config from "../config";

export const axiosInstance = axios.create({
  baseURL: `http://${config.TELRAAM_ENDPOINT}/`,
  headers: {
    "Content-Type": "application/json",
  },
});
