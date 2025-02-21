import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatmemberService } from '../chatmember/chatmember.service';
import { ChatblacklistService } from '../chatblacklist/chatblacklist.service';

interface ChatMessage {
  userId: number;
  roomId: number;
  message: string;
}

@WebSocketGateway({
  namespace: '/chatting',
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
export class ChattingGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatmemberService: ChatmemberService,
    private readonly chatblacklistService: ChatblacklistService,
  ) {}

  // 채팅방 입장
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { userId: number; roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // 채팅멤버 확인
      const chatMember = await this.chatmemberService.findByRoomAndUser(
        data.roomId,
        data.userId,
      );

      // 블랙리스트 확인
      const blacklists = await this.chatblacklistService.findAll();
      const isBlacklisted = blacklists.some(
        (blacklist) =>
          blacklist.user_id === data.userId &&
          blacklist.chatting_room_id === data.roomId,
      );

      if (isBlacklisted) {
        client.emit('error', { message: 'USER_BLACKLISTED' });
        return;
      }

      // 채팅방 입장
      client.join(`room_${data.roomId}`);

      // 입장 메시지 브로드캐스트
      this.server.to(`room_${data.roomId}`).emit('userJoined', {
        userId: data.userId,
        nickname: chatMember.user.nickname,
        message: '님이 입장하셨습니다.',
      });
    } catch (error) {
      console.error('Error joining room:', error);
      client.emit('error', { message: error.message });
    }
  }

  // 채팅 메시지 전송
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: ChatMessage,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // 채팅멤버 확인
      const chatMember = await this.chatmemberService.findByRoomAndUser(
        data.roomId,
        data.userId,
      );

      // 블랙리스트 확인
      const blacklists = await this.chatblacklistService.findAll();
      const isBlacklisted = blacklists.some(
        (blacklist) =>
          blacklist.user_id === data.userId &&
          blacklist.chatting_room_id === data.roomId,
      );

      if (isBlacklisted) {
        client.emit('error', { message: 'USER_BLACKLISTED' });
        return;
      }

      // 메시지 전송
      this.server.to(`room_${data.roomId}`).emit('newMessage', {
        userId: data.userId,
        nickname: chatMember.user.nickname,
        message: data.message,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('error', { message: error.message });
    }
  }

  // 채팅방 퇴장
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { userId: number; roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const chatMember = await this.chatmemberService.findByRoomAndUser(
        data.roomId,
        data.userId,
      );

      // 채팅방 퇴장
      client.leave(`room_${data.roomId}`);

      // 퇴장 메시지 브로드캐스트
      this.server.to(`room_${data.roomId}`).emit('userLeft', {
        userId: data.userId,
        nickname: chatMember.user.nickname,
        message: '님이 퇴장하셨습니다.',
      });
    } catch (error) {
      console.error('Error leaving room:', error);
      client.emit('error', { message: error.message });
    }
  }
}
