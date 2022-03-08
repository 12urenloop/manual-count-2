import axios, { Axios, AxiosInstance, AxiosResponse, Method } from "axios";
import config from "../config";
import { FastifyInstance } from "fastify";

export class AxiosService {
  public static instance: AxiosService;

  private server: FastifyInstance;
  private instance: AxiosInstance;
  // True if online; false if offline
  private telraamStatus: boolean;

  constructor(server: FastifyInstance) {
    this.instance = axios.create({
      baseURL: `http://${config.TELRAAM_ENDPOINT}/`,
      headers: {
        "Content-Type": "application/json"
      }
    });
    this.telraamStatus = true;
    this.server = server;
    AxiosService.instance = this;

    // Register status event
    this.server.ready(err => {
      this.server.io.on("connection", socket => {
        socket.on("telraamStatus", () => {
          socket.emit("telraamStatus", this.telraamStatus);
        });
      });
    });

  }

  public setTelraamStatus(status: boolean) {
    if (this.telraamStatus === status) return;
    this.telraamStatus = status;
    this.server.io.emit("telraamStatus", status);
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
        this.server.log.error(`Could not fetch teams from Telraam but connection was made: ${e.response.status}: ${e.response.statusText}`);
      } else if (e.request) {
        this.server.log.error(`Could not fetch teams from Telraam, timed out after: ${e.config.timeout / 1000}s`);
        this.server.log.error(`Did you set the correct TELRAAM_ENDPOINT in .env?`);
      } else {
        this.server.log.error(e);
      }
      this.setTelraamStatus(false);
      return Promise.reject(e);
    }
  }
}