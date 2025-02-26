import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatmemberService } from './chatmember.service';
import { ChattingGateway } from '../chatting/chatting.gateway';

@WebSocketGateway({
  namespace: '/chatmember',
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
export class ChatmemberGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatmemberService: ChatmemberService,
    private readonly chattingGateway: ChattingGateway,
  ) {}

  // 채팅멤버 생성
  @SubscribeMessage('createChatmember')
  async handleCreateChatmember(
    @MessageBody() data: { userId: number; createChatmemberDto: any },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const chatmember = await this.chatmemberService.createChatmember(
        data.userId,
        data.createChatmemberDto,
      );
      // 개별 클라이언트에게 생성 완료 알림
      client.emit('chatmemberCreated', chatmember);
      // 모든 클라이언트에게 업데이트된 목록 전송
      const allChatmembers = await this.chatmemberService.findAllChatMember();
      this.server.emit('allChatMembers', allChatmembers);
    } catch (error) {
      console.error('Error creating chatmember:', error);
      client.emit('error', { message: 'Failed to create chatmember' });
    }
  }

  // 채팅멤버 전체 조회
  @SubscribeMessage('findAllChatMember')
  async handleFindAllChatMember(@ConnectedSocket() client: Socket) {
    try {
      const chatmembers = await this.chatmemberService.findAllChatMember();
      client.emit('allChatMembers', chatmembers);
    } catch (error) {
      console.error('Error finding all chatmembers:', error);
      client.emit('error', { message: 'Failed to find chatmembers' });
    }
  }

  // 채팅멤버 상세조회
  @SubscribeMessage('findOneChatMember')
  async handleFindOneChatMember(
    @MessageBody() data: { chatmemberId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const chatmember = await this.chatmemberService.findOneChatMember(
        data.chatmemberId,
      );
      client.emit('chatmemberDetails', chatmember);
    } catch (error) {
      console.error('Error finding chatmember:', error);
      client.emit('error', { message: 'Failed to find chatmember' });
    }
  }

  // 채팅방 임시 나가기 (멤버 유지)
  @SubscribeMessage('temporaryLeaveChatRoom')
  async handleTemporaryLeave(
    @MessageBody() data: { userId: number; roomId: number; nickname: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // 소켓 이벤트만 처리하고 멤버는 삭제하지 않음
      client.emit('userLeft', { 
        userId: data.userId, 
        roomId: data.roomId,
        nickname: data.nickname 
      });
    } catch (error) {
      console.error('Error leaving chat room:', error);
      client.emit('error', { message: 'Failed to leave chat room' });
    }
  }

  // 채팅방 완전히 나가기 (멤버 삭제)
  @SubscribeMessage('permanentLeaveChatRoom')
  async handlePermanentLeave(
    @MessageBody() data: { userId: number; roomId: number; nickname: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatmemberService.deleteChatMember(data.userId, data.roomId);
      
      // 채팅 게이트웨이를 통해 메시지 전송
      this.chattingGateway.server.to(`room_${data.roomId}`).emit('message', {
        type: 'system',
        roomId: data.roomId,
        message: `${data.nickname}님이 채팅방을 완전히 나가셨습니다.`,
        timestamp: new Date(),
      });

      // 개별 클라이언트에게 삭제 완료 알림
      client.emit('chatmemberDeleted', { userId: data.userId, roomId: data.roomId });
      
      // 모든 클라이언트에게 업데이트된 목록 전송
      const allChatmembers = await this.chatmemberService.findAllChatMember();
      this.server.emit('allChatMembers', allChatmembers);
    } catch (error) {
      console.error('Error deleting chatmember:', error);
      client.emit('error', { message: 'Failed to delete chatmember' });
    }
  }
}
