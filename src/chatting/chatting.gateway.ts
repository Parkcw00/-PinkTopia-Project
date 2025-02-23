import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatmemberService } from '../chatmember/chatmember.service';
import { ChatblacklistService } from '../chatblacklist/chatblacklist.service';
import { ChattingService } from '../chatting/chatting.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { NotFoundException } from '@nestjs/common';

interface ChatMessage {
  userId: number;
  roomId: number;
  message: string;
}

@WebSocketGateway({
  namespace: 'chatting',
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
    credentials: true,
  },
})
export class ChattingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatmemberService: ChatmemberService,
    private readonly chatblacklistService: ChatblacklistService,
    private readonly chattingService: ChattingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;

      if (!token) {
        throw new WsException('인증 토큰이 없습니다.');
      }

      const tokenWithoutBearer = token.replace('Bearer ', '');

      try {
        const decoded = this.jwtService.verify(tokenWithoutBearer, {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET_KEY')
        });

        client.data.user = decoded;
      } catch (error) {
        throw new WsException('유효하지 않은 토큰입니다.');
      }

    } catch (error) {
      client.disconnect();
    }
  }

  // 채팅방 입장
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, data: { roomId: number }) {
    try {
      console.log('방 입장 요청:', data);
      
      const user = client.data.user;
      if (!user) {
        throw new WsException('인증되지 않은 사용자입니다.');
      }

      try {
        // 채팅멤버 확인 및 사용자 정보 조회
        const chatMember = await this.chatmemberService.findByRoomAndUser(
          data.roomId,
          user.id,
        );

        // 블랙리스트 확인
        const blacklists = await this.chatblacklistService.findAll();
        const isBlacklisted = blacklists.some(
          (blacklist) =>
            blacklist.user_id === user.id &&
            blacklist.chatting_room_id === data.roomId,
        );

        if (isBlacklisted) {
          client.emit('error', { message: 'USER_BLACKLISTED' });
          return { success: false, message: 'USER_BLACKLISTED' };
        }

        // 채팅방 입장
        await client.join(`room_${data.roomId}`);
        
        // 입장 메시지 브로드캐스트 (닉네임 사용)
        this.server.to(`room_${data.roomId}`).emit('userJoined', {
          userId: user.id,
          nickname: chatMember.user.nickname // 닉네임 사용
        });

        return { success: true };
      } catch (error) {
        if (error instanceof NotFoundException) {
          console.log('채팅 멤버가 아님:', error.message);
          return { success: false, message: error.message };
        }
        throw error;
      }
    } catch (error) {
      console.error('방 입장 중 에러:', error);
      return { success: false, message: error.message };
    }
  }

  // 채팅 메시지 전송
  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, data: { roomId: number; message: string }) {
    try {
      console.log('메시지 수신:', data);
      
      const user = client.data.user;
      if (!user) {
        throw new WsException('인증되지 않은 사용자입니다.');
      }

      // 사용자 닉네임 조회
      const chatMember = await this.chatmemberService.findByRoomAndUser(
        data.roomId,
        user.id
      );

      // 메시지 저장 및 브로드캐스트
      const messageData = {
        userId: user.id,
        nickname: chatMember.user.nickname || user.email, // 닉네임이 없으면 이메일 사용
        message: data.message,
        timestamp: new Date().toISOString()
      };

      // DB에 메시지 저장
      await this.chattingService.saveMessage(data.roomId, user.id, data.message);

      // 같은 방의 모든 사용자에게 메시지 전송
      this.server.to(`room_${data.roomId}`).emit('message', messageData);

      return { success: true };
    } catch (error) {
      console.error('메시지 처리 중 에러:', error);
      return { success: false, message: error.message };
    }
  }

  // 채팅방 퇴장
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @MessageBody() data: { userId: number; roomId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // 사용자 정보 조회
      const user = client.data.user;
      if (!user) {
        throw new WsException('인증되지 않은 사용자입니다.');
      }

      // 채팅멤버 정보 조회 (소켓 연결 해제 전에 수행)
      const chatMember = await this.chatmemberService.findByRoomAndUser(
        data.roomId,
        user.id
      );

      // 퇴장하는 클라이언트의 소켓만 방에서 나가도록 수정
      await client.leave(`room_${data.roomId}`);

      // 퇴장 메시지 브로드캐스트 (닉네임 사용)
      this.server.to(`room_${data.roomId}`).emit('userLeft', {
        userId: user.id,
        nickname: chatMember.user.nickname
      });

      // 퇴장한 사용자의 소켓 연결만 해제
      client.disconnect(true);

      return { success: true };
    } catch (error) {
      console.error('채팅방 나가기 중 에러:', error);
      return { success: false, message: error.message };
    }
  }

  // 연결 해제 처리
  handleDisconnect(client: Socket) {
    console.log('클라이언트 연결 종료:', client.id);
    // 다른 사용자의 연결은 유지
  }
}
