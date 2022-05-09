import { v4 } from "uuid";
import { server } from "../main";
import { Token } from "../models/token.model";

class AuthService {
  // region SingleTon
  private static Instance: AuthService;

  public static getInstance(): AuthService {
    if (!this.Instance) {
      this.Instance = new AuthService();
    }
    return this.Instance;
  }

  /**
   * Map with all connected sockets and their auth token
   */
  private connectedClients: Map<string, string | null>;

  constructor() {
    this.connectedClients = new Map();
  }

  public registerNewClient(socket: string) {
    if (this.connectedClients.has(socket)) {
      server.log.error("Duplicate socket found!");
    }
    this.connectedClients.set(socket, null);
  }

  public handleSocketDisconnection(socket: string) {
    this.connectedClients.delete(socket);
  }

  public async authClient(socketId: string, token: string): Promise<boolean> {
    const client = await Token.findOne({
      token,
    });
    if (!client) {
      server.log.warn(`Client(${socketId}) tried to authenticate with an invalid token`);
      return false;
    }
    server.log.info(`Client(${socketId}) authenticated with ${token}`);
    this.connectedClients.set(socketId, token);
    return true;
  }

  public async generateNewToken() {
    let token = v4();
    let existingToken = await Token.findOne({ token });
    while (existingToken) {
      token = v4();
      existingToken = await Token.findOne({ token });
    }
    const dbToken = new Token();
    dbToken.token = token;
    await dbToken.save();
    return token;
  }

  public getConnectedClients() {
    // Filter all non-authed clients away
    const authedClients = new Map<string, string>();
    this.connectedClients.forEach((v, k) => {
      if (!v) return;
      authedClients.set(k, v);
    });
    return authedClients;
  }

  public getClientToken(socketId: string) {
    return this.connectedClients.get(socketId);
  }
}

const authService = AuthService.getInstance();

export default authService;
