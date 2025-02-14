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
  Request
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { UserGuard } from './guards/user-guard';

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
    return await this.userService.sendCode(createUserDto.email, createUserDto.password);
  }

  // 이메일 인증코드 전송(인증코드 재전송, 회원가입은 하고 인증 안한 사용자용)
  @Post('/auth/send-code')
  async sendCode(@Body() body:{email: string, password: string}) {
    return this.userService.sendCode(body.email, body.password);
  }

  // 이메일 인증
  @Post('/auth/verify-code')
  async verifyCode(@Body() body: {email: string, verificationCode: string}) {
    return this.userService.verifyCode(body.email, body.verificationCode)
  }

  // 로그인
  @Post('/auth/login')
  async logIn(@Body() body: {email: string, password: string}, @Res() res: Response){
    return this.userService.logIn(body.email, body.password, res)
  }

  // 로그아웃
  @UseGuards(UserGuard)
  @Post('/auth/logout')
  async logOut(@Request() req, @Res() res: Response){
    return this.userService.logOut(req.user, res);
  }
}
