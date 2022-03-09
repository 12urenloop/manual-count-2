import axios, { AxiosInstance, AxiosResponse, Method } from "axios";
import { Socket } from "socket.io";
import config from "../config";
import { server } from "../main";

export class AxiosService {
  private instance: AxiosInstance;
  // True if online; false if offline
  private telraamStatus: boolean;

  constructor() {
    this.instance = axios.create({
      baseURL: `http://${config.TELRAAM_ENDPOINT}/`,
      headers: {
        "Content-Type": "application/json"
      }
    });
    this.telraamStatus = true;

    // Register status event
    server.ready(err => {
      server.io.on("connection", (socket: Socket) => {
        socket.on("telraamStatus", () => {
          socket.emit("telraamStatus", this.telraamStatus);
        });
      });
    });
  }

  public setTelraamStatus(status: boolean) {
    if (this.telraamStatus === status) return;
    this.telraamStatus = status;
    server.io.emit("telraamStatus", status);
  }

  public async request<T = any>(method: Method, url: string, data?: any): Promise<AxiosResponse<T, any>> {
    try {
      const response = await this.instance.request<T>({
        url,
        method,
        data
      });
      if (response.status === 200) {
        this.setTelraamStatus(true);
      }
      return response;
    } catch (e: any) {
      if (e.response) {
        server.log.error(`Could not fetch teams from Telraam but connection was made: ${e.response.status}: ${e.response.statusText}`);
      } else if (e.request) {
        server.log.error(`Could not fetch teams from Telraam, timed out after: ${e.config.timeout / 1000}s`);
        server.log.error(`Did you set the correct TELRAAM_ENDPOINT in .env?`);
      } else {
        server.log.error(e);
      }
      this.setTelraamStatus(false);
      return Promise.reject(e);
    }
  }
}

const axiosService = new AxiosService();
export default axiosService