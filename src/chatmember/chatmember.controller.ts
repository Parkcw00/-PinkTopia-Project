import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatmemberService } from './chatmember.service';
import { CreateChatmemberDto } from './dto/create-chatmember.dto';
import { UserGuard } from 'src/user/guards/user-guard';
import { ApiOperation } from '@nestjs/swagger';
@Controller('chatmember')
export class ChatmemberController {
  constructor(private readonly chatmemberService: ChatmemberService) {}

  @ApiOperation({ summary: '채팅멤버 생성' })
  @UseGuards(UserGuard)
  @Post()
  createChatmember(
    @Request() req,
    @Body() createChatmemberDto: CreateChatmemberDto,
  ) {
    const userId = req.user.id;
    return this.chatmemberService.createChatmember(userId, createChatmemberDto);
  }

  @ApiOperation({ summary: '채팅멤버 전체 조회' })
  @Get()
  findAllChatMember() {
    return this.chatmemberService.findAllChatMember();
  }

  @ApiOperation({ summary: '채팅멤버 조회' })
  @UseGuards(UserGuard)
  @Get(':id')
  findOneChatMember(@Param('id') id: string) {
    return this.chatmemberService.findOneChatMember(+id);
  }

  @ApiOperation({ summary: '채팅방에서 나가기' })
  @UseGuards(UserGuard)
  @Delete(':id')
  deleteChatMember(@Param('id') id: string) {
    return this.chatmemberService.deleteChatMember(+id);
  }
}
