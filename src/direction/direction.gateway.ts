// pinkmong.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class DirectionGateway {
  @WebSocketServer() server: Server;

  sendPopup(
    @ConnectedSocket() client: Socket,
    userId: number,
    message: string,
  ) {
    client.emit('showPopup', { userId, message });
  }
}
