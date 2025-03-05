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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { UserGuard } from './guards/user-guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LogInDto } from './dto/log-in.dto';
import { VerifyDto } from './dto/verify-dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('User 기능')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('upload-profile')
  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.userService.uploadProfileImage(req.user, file);
  }

  @Delete('delete-profile')
  @UseGuards(UserGuard)
  async deleteProfileImage(@Request() req) {
    return await this.userService.deleteProfileImage(req.user);
  }

  // 포인트랭킹api
  @ApiOperation({ summary: '포인트 랭킹 조회' })
  @Get('ranking/point')
  async getRanking() {
    return await this.userService.getRanking();
  }

  // 달성 업적 랭킹api
  @ApiOperation({ summary: '달성 업적 조회' })
  @Get('ranking/achievement')
  async getRankingAchievement() {
    return await this.userService.getRankingAchievement();
  }

  // 회원가입, 이메일 인증코드 전송
  @ApiOperation({ summary: '회원가입' })
  @Post('/auth/sign-up')
  async signUp(@Body() createUserDto: CreateUserDto) {
    await this.userService.signUp(createUserDto);
    return await this.userService.sendCode(
      createUserDto.email,
      createUserDto.password,
    );
  }

  // 이메일 인증코드 전송(인증코드 재전송, 회원가입은 하고 인증 안한 사용자용)
  @ApiOperation({ summary: '이메일 인증코드 재전송' })
  @Post('/auth/send-code')
  async sendCode(@Body() logInDto: LogInDto) {
    return await this.userService.sendCode(logInDto.email, logInDto.password);
  }

  // 이메일 인증
  @ApiOperation({ summary: '이메일 인증' })
  @Post('/auth/verify-code')
  async verifyCode(@Body() verifyDto: VerifyDto) {
    return await this.userService.verifyCode(
      verifyDto.email,
      verifyDto.verificationCode,
    );
  }

  // 로그인
  @ApiOperation({ summary: '로그인' })
  @Post('/auth/login')
  async logIn(@Body() logInDto: LogInDto, @Res() res: Response) {
    console.log(`------>`, logInDto);
    return await this.userService.logIn(logInDto.email, logInDto.password, res);
  }

  // 로그아웃
  @ApiOperation({ summary: '로그아웃' })
  @UseGuards(UserGuard)
  @Post('/auth/logout')
  async logOut(@Request() req, @Res() res: Response) {
    return await this.userService.logOut(req.user, res);
  }

  // 내 정보 조회
  @ApiOperation({ summary: '내 정보 조회' })
  @UseGuards(UserGuard)
  @Get('/me')
  async getMyInfo(@Request() req) {
    return await this.userService.getMyInfo(req.user);
  }

  // 내 정보 수정
  @ApiOperation({ summary: '내 정보 수정' })
  @UseGuards(UserGuard)
  @Patch('/me')
  async updateMyInfo(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateMyInfo(req.user, updateUserDto);
  }

  // 회원 탈퇴
  @ApiOperation({ summary: '회원 탈퇴' })
  @UseGuards(UserGuard)
  @Delete('/me')
  async deleteMe(@Request() req) {
    return await this.userService.deleteMe(req.user);
  }

  @Post('charge-diamond')
  @UseGuards(UserGuard)
  @ApiOperation({ summary: '다이아 충전' })
  async chargeDiamond(
    @Request() req,
    @Body() body: { amount: number; paymentKey: string; orderId: string },
  ) {
    return await this.userService.chargeDiamond(req.user.id, body.amount);
  }

  //엑세스 토큰 갱신
  @ApiOperation({ summary: '엑세스 토큰 갱신' })
  @Post('/auth/refresh')
  async refreshAccessToken(@Request() req, @Res() res: Response) {
    const refreshToken = req.cookies.refreshToken; // 쿠키에서 리프레시 토큰 가져오기
    return await this.userService.refreshAccessToken(refreshToken, res);
  }
}

@ApiTags('Users 기능')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  // 유저조회
  @ApiOperation({ summary: '유저 조회' })
  @UseGuards(UserGuard)
  @Get('/:userId')
  async getUserInfo(@Param('userId') userId: number) {
    return await this.userService.getUserInfo(userId);
  }
}
