import { CanActivate, ExecutionContext, Injectable, ForbiddenException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // ✅ request.user가 존재하는지 확인
    if (!request.user) {
      throw new UnauthorizedException('로그인이 필요합니다.');
    }

    // ✅ request.user.role 값 확인 (콘솔 로그 추가)
    console.log(`✅ AdminGuard - 현재 사용자의 role 값:`, request.user.role);

    // ✅ role이 ture(운영자)인지 확인
    if (request.user.role !== 1) {
      throw new ForbiddenException('관리자 권한이 필요합니다.');
    }

    return true; // 관리자 권한 확인 완료
  }
}