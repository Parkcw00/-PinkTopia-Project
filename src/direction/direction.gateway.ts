// pinkmong.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class DirectionGateway {
  @WebSocketServer() server: Server;

  sendPopup(userId: number, message: string) {
    this.server.emit('showPopup', { userId, message });
  }
}
