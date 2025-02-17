import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { UserGuard } from './guards/user-guard';
import { LoginDto } from './dto/login.dto';
import { VerifycodeDto } from './dto/verifycode.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 포인트랭킹api
  @Get('ranking/point')
  async getRanking() {
    return await this.userService.getRanking();
  }

  // 달성 업적 랭킹api
  @Get('ranking/achievement')
  async getRankingAchievement() {
    return await this.userService.getRankingAchievement();
  }

  // 회원가입, 이메일 인증코드 전송
  @Post('/auth/sign-up')
  async signUp(@Body() createUserDto: CreateUserDto) {
    await this.userService.signUp(createUserDto);
    return await this.userService.sendCode(
      createUserDto.email,
      createUserDto.password,
    );
  }

  // 이메일 인증코드 전송(인증코드 재전송, 회원가입은 하고 인증 안한 사용자용)
  @Post('/auth/send-code')
  async sendCode(@Body() loginDto: LoginDto) {
    return await this.userService.sendCode(loginDto.email, loginDto.password);
  }

  // 이메일 인증
  @Post('/auth/verify-code')
  async verifyCode(@Body() verifycodeDto: VerifycodeDto) {
    return await this.userService.verifyCode(
      verifycodeDto.email,
      verifycodeDto.verificationCode,
    );
  }

  // 로그인
  @Post('/auth/login')
  async logIn(@Body() loginDto: LoginDto, @Res() res: Response) {
    return await this.userService.logIn(loginDto.email, loginDto.password, res);
  }

  // 로그아웃
  @UseGuards(UserGuard)
  @Post('/auth/logout')
  async logOut(@Request() req, @Res() res: Response) {
    return await this.userService.logOut(req.user, res);
  }

  // 내 정보 조회
  @UseGuards(UserGuard)
  @Get('/me')
  async getMyInfo(@Request() req) {
    return await this.userService.getMyInfo(req.user);
  }

  // 내 정보 수정
  @UseGuards(UserGuard)
  @Patch('/me')
  async updateMyInfo(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateMyInfo(req.user, updateUserDto);
  }

  // 회원 탈퇴
  @UseGuards(UserGuard)
  @Delete('/me')
  async deleteMe(@Request() req) {
    return await this.userService.deleteMe(req.user);
  }
}

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  // 유저조회
  @UseGuards(UserGuard)
  @Get('/:userId')
  async getUserInfo(@Param('userId') userId: number) {
    return await this.userService.getUserInfo(userId);
  }
}
