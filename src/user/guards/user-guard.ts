import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user.repository';
import { Response } from 'express';
import { UserService } from '../user.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const reqest = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    let accessToken = reqest.headers.authorization?.split(' ')[1];
    const refreshToken = reqest.cookies.refreshToken;
    const currentTime = Math.floor(Date.now() / 1000);
    const accessTokenKey = this.configService.get<string>(
      'ACCESS_TOKEN_SECRET_KEY',
    );
    const refreshTokenKey = this.configService.get<string>(
      'REFRESH_TOKEN_SECRET_KEY',
    );
    // 둘 다 존재하지 않는 경우
    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('로그인을 진행해 주세요');
    }

    // access token 만료기간 검증
    if (accessToken) {
      const decoded = this.jwtService.verify(accessToken, {
        secret: accessTokenKey,
        ignoreExpiration: true,
      });
      if (decoded.exp < currentTime) {
        accessToken = null;
      }
      const payload = { id: decoded.id, email: decoded.email };
      const newAccessToken = await this.makeAccessToken(payload);
      accessToken = newAccessToken;
    }

    // access token만 존재하지 않는 경우, refresh token 존재
    if (!accessToken && refreshToken) {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: refreshTokenKey,
        ignoreExpiration: true,
      });
      if (decoded.exp < currentTime) {
        response.clearCookie('refreshToken');
        throw new Error('다시 로그인 해주세요.');
      } // refresh token 만료되었을 때 재로그인 유도

      const payload = { id: decoded.id, email: decoded.email };
      const newAccessToken = await this.makeAccessToken(payload);
      accessToken = newAccessToken;
    }

    // access token 검증
    const decoded = this.jwtService.verify(accessToken, {
      secret: accessTokenKey,
    });
    let existUser = await this.userRepository.findEmail(decoded.email);
    if (!existUser) {
      throw new BadRequestException('인증되지 않은 사용자 입니다.');
    }
    if (this.userService.logOutUsers[existUser.id]) {
      throw new BadRequestException('다시 로그인 해주세요.');
    }
    try {
      reqest.user = {
        id: decoded.id, // JWT 생성 시 sub에 user.id 저장
        email: decoded.email, // 이메일 정보도 저장
      };
      if (refreshToken) {
        response.setHeader('Authorization', `Bearer ${accessToken}`);
      }
    } catch (err) {
      throw new InternalServerErrorException('오류가 발생하였습니다.');
    }

    return true; // 요청 허용
  }

  // access token 생성 메서드
  private async makeAccessToken(payload: object) {
    const accessTokenExpiresIn = this.configService.get<string>(
      'ACCESS_TOKEN_EXPIRES_IN',
    );
    const newAccessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_SECRET_KEY'),
      expiresIn: accessTokenExpiresIn,
    });
    return newAccessToken;
  }
}
