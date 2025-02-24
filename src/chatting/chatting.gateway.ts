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
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type']
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
      console.log('소켓 연결 시도:', client.id);  // 연결 시도 로그
      const token = client.handshake.auth.token;
      console.log('받은 토큰:', token);  // 토큰 확인

      if (!token) {
        console.log('토큰 없음');
        throw new WsException('인증 토큰이 없습니다.');
      }

      // Bearer 토큰에서 실제 토큰 추출
      const tokenWithoutBearer = token.replace('Bearer ', '');
      console.log('처리된 토큰:', tokenWithoutBearer);

      try {
        const decoded = this.jwtService.verify(tokenWithoutBearer, {
          secret: this.configService.get<string>('ACCESS_TOKEN_SECRET_KEY')
        });
        console.log('토큰 검증 성공:', decoded);  // 디코딩된 정보 확인

        client.data.user = decoded;
        console.log('클라이언트 데이터 설정:', client.data);  // 클라이언트 데이터 확인
      } catch (error) {
        console.log('토큰 검증 실패:', error);
        throw new WsException('유효하지 않은 토큰입니다.');
      }

    } catch (error) {
      console.error('연결 처리 중 에러:', error);
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
      console.log('메시지 수신:', data, client.data);
      
      const user = client.data.user;
      if (!user) {
        console.log('인증되지 않은 사용자');
        throw new WsException('인증되지 않은 사용자입니다.');
      }

      // 사용자 닉네임 조회
      const chatMember = await this.chatmemberService.findByRoomAndUser(
        data.roomId,
        user.id
      );
      console.log('채팅 멤버 정보:', chatMember);

      // 메시지 저장 및 브로드캐스트
      const messageData = {
        userId: user.id,
        nickname: chatMember.user.nickname || user.email,
        message: data.message,
        timestamp: new Date().toISOString()
      };
      console.log('전송할 메시지 데이터:', messageData);

      // DB에 메시지 저장
      await this.chattingService.create(user, data.roomId.toString(), {message: data.message});

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

      // 퇴장 메시지 브로드캐스트 (닉네임 포함)
      this.server.to(`room_${data.roomId}`).emit('userLeft', {
        userId: user.id,
        nickname: chatMember.user.nickname
      });

      // 잠시 대기하여 메시지가 전송될 시간을 확보
      await new Promise(resolve => setTimeout(resolve, 100));

      // 채팅방에서 소켓 연결 해제
      await client.leave(`room_${data.roomId}`);

      // 채팅방 멤버에서도 제거
      await this.chatmemberService.deleteChatMember(chatMember.id);

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
