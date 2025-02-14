import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChattingService } from './chatting.service';
import { CreateChattingDto } from './dto/create-chatting.dto';

@Controller('chattingroom/:chattingroomId')
export class ChattingController {
  constructor(private readonly chattingService: ChattingService) {}

  // 조회랑 채팅 생성 전부 유저 인증이 필요함
  @Post('chatting')
  create(
    @Param('chattingroomId') chatting_room_id: string,
    @Body() createChattingDto: CreateChattingDto,
  ) {
    return this.chattingService.create(chatting_room_id, createChattingDto);
  }

  @Get('chattings')
  findAll(@Param('chattingroomId') chatting_room_id: string) {
    return this.chattingService.findAll(chatting_room_id);
  }
}
