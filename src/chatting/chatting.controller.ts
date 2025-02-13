import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ChattingService } from './chatting.service';
import { CreateChattingDto } from './dto/create-chatting.dto';

@Controller('chattingroom/:chattingroom_id')
export class ChattingController {
  constructor(private readonly chattingService: ChattingService) {}

  @Post('chatting')
  create(
    @Param('chattingroomId') chattingroomId: string,
    @Body() createChattingDto: CreateChattingDto,
  ) {
    return this.chattingService.create(createChattingDto);
  }

  @Get('chattings')
  findAll(@Param('chattingroomId') chattingroomId: string) {
    return this.chattingService.findAll();
  }
}
