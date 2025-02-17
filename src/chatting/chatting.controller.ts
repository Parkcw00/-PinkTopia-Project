import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChattingService } from './chatting.service';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserGuard } from 'src/user/guards/user-guard';

@ApiTags('채팅 조회 및 생성')
@Controller('chattingroom/:chattingroomId')
export class ChattingController {
  constructor(private readonly chattingService: ChattingService) {}

  // 조회랑 채팅 생성 전부 유저 인증이 필요함
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

  @ApiOperation({ summary: '채팅 조회' })
  @UseGuards(UserGuard)
  @Get('chattings')
  findAll(@Request() req, @Param('chattingroomId') chatting_room_id: string) {
    return this.chattingService.findAll(req.user, chatting_room_id);
  }
}
