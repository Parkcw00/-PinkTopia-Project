import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ChattingService } from './chatting.service';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserGuard } from '../user/guards/user-guard';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('채팅 조회 및 생성')
@Controller('chattingroom/:chattingroomId')
export class ChattingController {
  constructor(private readonly chattingService: ChattingService) {}

  @Get('debug-sentry')
  getError() {
    throw new Error('My first Sentry error!');
  }

  @Get('hi')
  getError2() {
    throw new Error('hello, world!');
  }

  // 조회랑 채팅 생성 전부 유 인증이 필요함
  @ApiOperation({ summary: '채팅 생성' })
  @UseGuards(UserGuard)
  @Post('chatting')
  create(
    @Request() req,
    @Param('chattingroomId') chatting_room_id: string,
    @Body() createChattingDto: CreateChattingDto,
  ) {
    return this.chattingService.create(
      req.user,
      chatting_room_id,
      createChattingDto,
    );
  }

  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  uploadFile(
    @Request() req,
    @Param('chattingroomId') chatting_room_id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.chattingService.uploadFile(req.user, chatting_room_id, file);
  }

  @ApiOperation({ summary: '채팅 조회' })
  @UseGuards(UserGuard)
  @Get('chattings')
  findAll(@Request() req, @Param('chattingroomId') chatting_room_id: string) {
    return this.chattingService.findAll(req.user, chatting_room_id);
  }

  @ApiOperation({ summary: 'Sentry 에러 테스트' })
  @Get('test-sentry')
  testSentryError() {
    throw new Error('This is a test error for Sentry monitoring');
  }
}
