import { FastifyInstance } from "fastify";
import authService from "../services/auth.service";

export default (server:FastifyInstance) => {
  server.get('/auth', async (_, res) => {
    try {
      const newToken = await authService.generateNewToken();
      return res.code(200).send({
        token: newToken
      })
    } catch (e) {
      server.log.error(`Encountered following error while trying to authenticate a client ${e}`)
      return res.code(500).send({
        error:'Couldn\'t generate token for client.',
        code: 500
      })
    }
  })
  server.ready(()=>{
    server.io.on('connection', socket=>{
      socket.on('authClient', async (data, cb) => {
        try {
          const isSuccess = await authService.authClient(socket.id, data.token)
          cb(isSuccess);
        } catch (e) {
          server.log.warn(`client(${socket.id}) failed to authenticate with the server`)
          cb(false);
        }
      })
    })
  })
}