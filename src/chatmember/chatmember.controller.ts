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
  async leaveChatRoom(@Param('id') id: string) {
    // 채팅방 나가기 성공 메시지만 반환
    return { message: '채팅방을 나갔습니다.' };
  }

  @ApiOperation({ summary: '채팅방 멤버 확인' })
  @UseGuards(UserGuard)
  @Get('check/:roomId')
  async checkChatMember(@Param('roomId') roomId: string, @Request() req) {
    const userId = req.user.id;
    return await this.chatmemberService.findByRoomAndUser(+roomId, userId);
  }

  @ApiOperation({ summary: '채팅방 임시 나가기 (멤버 유지)' })
  @UseGuards(UserGuard)
  @Post('temporary-leave/:roomId')
  async temporaryLeaveRoom(@Param('roomId') roomId: string, @Request() req) {
    return { message: '채팅방을 나갔습니다.' };
  }

  @ApiOperation({ summary: '채팅방 완전히 나가기 (멤버 삭제)' })
  @UseGuards(UserGuard)
  @Delete('permanent-leave/:roomId')
  async permanentLeaveRoom(@Param('roomId') roomId: string, @Request() req) {
    return this.chatmemberService.deleteChatMember(req.user.id, +roomId);
  }
}
