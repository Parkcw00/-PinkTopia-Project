import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatmemberService } from './chatmember.service';

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

  constructor(private readonly chatmemberService: ChatmemberService) {}

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
      console.log(`Chatmember created for user ${data.userId}`);
      client.emit('chatmemberCreated', chatmember);
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

  // 채팅방 나가기
  @SubscribeMessage('deleteChatMember')
  async handleDeleteChatMember(
    @MessageBody() data: { chatmemberId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatmemberService.deleteChatMember(data.chatmemberId);
      client.emit('chatmemberDeleted', { chatmemberId: data.chatmemberId });
    } catch (error) {
      console.error('Error deleting chatmember:', error);
      client.emit('error', { message: 'Failed to delete chatmember' });
    }
  }
}
