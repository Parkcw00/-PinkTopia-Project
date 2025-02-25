import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ValkeyService } from 'src/valkey/valkey.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true,
  },
})
export class UserGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly valkeyService: ValkeyService,
  ) {}

  @SubscribeMessage('checkAuth')
  async handleCheckAuth(@ConnectedSocket() client: Socket) {
    try {
      const cookies = client.handshake.headers.cookie;
      if (!cookies) {
        return { success: false, message: '인증 정보가 없습니다.' };
      }

      // 쿠키 문자열을 파싱하여 refreshToken 추출
      const cookieArray = cookies.split(';');
      const refreshTokenCookie = cookieArray.find((cookie) =>
        cookie.trim().startsWith('refreshToken='),
      );

      if (!refreshTokenCookie) {
        return { success: false, message: 'refresh token이 없습니다.' };
      }

      const refreshToken = refreshTokenCookie.split('=')[1];

      // refreshToken 검증
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET_KEY'),
      });

      if (!decoded) {
        return { success: false, message: '유효하지 않은 토큰입니다.' };
      }

      // 로그아웃된 사용자인지 확인
      if (await this.valkeyService.get(`logOutUsers:${decoded.id}`)) {
        return { success: false, message: '로그아웃된 사용자입니다.' };
      }

      // 사용자 정보 조회
      const userInfo = await this.userService.getMyInfo({
        email: decoded.email,
      });

      return {
        success: true,
        user: {
          id: userInfo.id,
          email: userInfo.email,
          nickname: userInfo.nickname,
        },
      };
    } catch (error) {
      console.error('인증 확인 중 오류:', error);
      return { success: false, message: '인증 확인 중 오류가 발생했습니다.' };
    }
  }

  @SubscribeMessage('logout')
  async handleLogout(@ConnectedSocket() client: Socket) {
    try {
      const cookies = client.handshake.headers.cookie;
      if (cookies) {
        const cookieArray = cookies.split(';');
        const refreshTokenCookie = cookieArray.find((cookie) =>
          cookie.trim().startsWith('refreshToken='),
        );

        if (refreshTokenCookie) {
          const refreshToken = refreshTokenCookie.split('=')[1];
          const decoded = this.jwtService.verify(refreshToken, {
            secret: this.configService.get<string>('REFRESH_TOKEN_SECRET_KEY'),
          });

          // 로그아웃 상태 저장
          this.valkeyService.set(`logOutUsers:${decoded.id}`, true);
        }
      }

      client.disconnect();
      return { success: true, message: '로그아웃되었습니다.' };
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
      return { success: false, message: '로그아웃 중 오류가 발생했습니다.' };
    }
  }
}
