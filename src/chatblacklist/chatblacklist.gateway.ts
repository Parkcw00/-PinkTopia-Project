import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatblacklistService } from './chatblacklist.service';

@WebSocketGateway({
  namespace: '/chatblacklist',
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['content-type'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
  transports: ['websocket', 'polling'],
})
export class ChatblacklistGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatblacklistService: ChatblacklistService) {}

  // 블랙리스트 추가
  @SubscribeMessage('createBlacklist')
  async handleCreateBlacklist(
    @MessageBody() data: { userId: number; createChatblacklistDto: any },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const blacklist = await this.chatblacklistService.createChatblacklist(
        data.userId,
        data.createChatblacklistDto,
      );
      // 개별 클라이언트에게 생성 완료 알림
      client.emit('blacklistCreated', blacklist);
      // 모든 클라이언트에게 업데이트된 목록 전송
      const allBlacklists = await this.chatblacklistService.findAll();
      this.server.emit('allBlacklists', allBlacklists);
    } catch (error) {
      console.error('Error creating blacklist:', error);
      client.emit('error', { message: 'Failed to create blacklist' });
    }
  }

  // 블랙리스트 전체 조회
  @SubscribeMessage('findAllBlacklist')
  async handleFindAllBlacklist(@ConnectedSocket() client: Socket) {
    try {
      const blacklists = await this.chatblacklistService.findAll();
      client.emit('allBlacklists', blacklists);
    } catch (error) {
      console.error('Error finding all blacklists:', error);
      client.emit('error', { message: 'Failed to find blacklists' });
    }
  }

  // 블랙리스트 상세 조회
  @SubscribeMessage('findOneBlacklist')
  async handleFindOneBlacklist(
    @MessageBody() data: { blacklistId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const blacklist = await this.chatblacklistService.findOne(
        data.blacklistId,
      );
      client.emit('blacklistDetails', blacklist);
    } catch (error) {
      console.error('Error finding blacklist:', error);
      client.emit('error', { message: 'Failed to find blacklist' });
    }
  }

  // 블랙리스트 해제
  @SubscribeMessage('removeBlacklist')
  async handleRemoveBlacklist(
    @MessageBody() data: { blacklistId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatblacklistService.remove(data.blacklistId);
      // 개별 클라이언트에게 삭제 완료 알림
      client.emit('blacklistRemoved', { blacklistId: data.blacklistId });
      // 모든 클라이언트에게 업데이트된 목록 전송
      const allBlacklists = await this.chatblacklistService.findAll();
      this.server.emit('allBlacklists', allBlacklists);
    } catch (error) {
      console.error('Error removing blacklist:', error);
      client.emit('error', { message: 'Failed to remove blacklist' });
    }
  }
}
