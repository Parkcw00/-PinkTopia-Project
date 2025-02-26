import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LocationHistoryService } from './location-history.service';
import { UpdateLocationHistoryDto } from './dto/update-location-history.dto';

@WebSocketGateway({
  namespace: '/location',
  cors: {
    origin: [
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://127.0.0.1:3000',
    ], // ✅ CORS 정책 설정
    credentials: true, // ✅ 쿠키 및 인증 정보 포함
  },
})
export class LocationHistoryGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly locationHistoryService: LocationHistoryService,
  ) {}

  /**
   * ✅ 클라이언트가 10초마다 'updateLocation' 이벤트를 보냄
   * 최신 위치를 업데이트하고, 가장 오래된 7번째 기록을 삭제
   */
  @SubscribeMessage('updateLocation')
  async handleLocationUpdateValkey(
    @MessageBody()
    data: { userId: number; latitude: number; longitude: number },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('✅ [WebSocket] 사용자 위치 업데이트 요청:', data);

    const updateDto: UpdateLocationHistoryDto = {
      latitude: data.latitude,
      longitude: data.longitude,
    };

    await this.locationHistoryService.updateValkey(data.userId, updateDto);
    client.emit('locationUpdated', { message: '위치 업데이트 완료' });
  }

  /**
   * ✅ 10분마다 실행되는 DB 업데이트 요청 (현재 10분마다 실행)
   */
  @SubscribeMessage('updateLocationDB')
  async handleLocationUpdateDB(
    @MessageBody()
    data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('✅ [WebSocket] 사용자 위치 업데이트 요청:', data);

    await this.locationHistoryService.updateDB(data.userId);
    client.emit('locationUpdated', { message: '위치 업데이트 완료' });
  }
}
