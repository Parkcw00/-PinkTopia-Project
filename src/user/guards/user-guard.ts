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
import { ValkeyService } from 'src/valkey/valkey.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly userRepository: UserRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly valkeyService: ValkeyService,
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
    let accessDecoded: any;
    let refreshDecoded: any;
    if (accessToken) {
      accessDecoded = this.jwtService.verify(accessToken, {
        secret: accessTokenKey,
        ignoreExpiration: true,
      });
    }
    if (refreshToken) {
      refreshDecoded = this.jwtService.verify(refreshToken, {
        secret: refreshTokenKey,
        ignoreExpiration: true,
      });
    }
    let newAccessToken: any;

    // 둘 다 존재하지 않는 경우
    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException('로그인을 진행해 주세요');
    }

    // access token 존재, refresh token 존재x, 만료기간
    if (accessToken && !refreshToken && accessDecoded.exp < currentTime) {
      throw new UnauthorizedException('다시 로그인 해주세요.');
    }

    // access token만 존재하지 않는 경우, refresh token 존재, 만료기간
    if (!accessToken && refreshToken && refreshDecoded.exp < currentTime) {
      response.clearCookie('refreshToken');
      throw new UnauthorizedException('다시 로그인 해주세요.');
    }

    // 둘 다 존재, 둘다 만료기간 지난것
    if (
      refreshToken &&
      refreshDecoded.exp < currentTime &&
      accessToken < currentTime
    ) {
      response.clearCookie('refreshToken');
      throw new UnauthorizedException('다시 로그인 해주세요.');
    }

    // 위 조건 통과하는 애들 access token만 존재(만료x) or refresh token만 존재(만료x) or 둘다 존재(refresh token 만료x)
    // 이 중 access token 재부여할건? refreshToken만 and 만료xrefreshToken과 만료된 accessToken 가진것
    // new access token 발급
    if (
      (!accessToken && refreshToken) ||
      (accessDecoded.exp < currentTime && refreshDecoded.exp > currentTime)
    ) {
      const payload = {
        id: refreshDecoded.id,
        email: refreshDecoded.email,
        role: refreshDecoded.role,
      };
      newAccessToken = await this.makeAccessToken(payload);
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
    if (await this.valkeyService.get(`logoutUser:${existUser.id}`)) {
      throw new UnauthorizedException('다시 로그인 해주세요.');
    }
    const existUserrole =
      existUser.role === true
        ? 1
        : existUser.role === false
          ? 0
          : existUser.role;
    try {
      reqest.user = {
        id: decoded.id, // JWT 생성 시 sub에 user.id 저장
        email: decoded.email, // 이메일 정보도 저장
        role: existUserrole, // ✅ AdminGuard에서 사용할 role 값 저장
      };
      if (newAccessToken) {
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
