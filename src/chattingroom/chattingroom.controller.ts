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
import { UserGuard } from 'src/user/guards/user-guard';
import { ChattingRoomService } from './chattingroom.service';
import { ChangeAdmin } from './dto/change-admin.dto';
import { InviteUser } from './dto/invite-user.dto';

@Controller('chattingroom')
export class ChattingRoomController {
  constructor(private readonly chattingRoomService: ChattingRoomService) {}

  // 채팅방 생성
  @UseGuards(UserGuard)
  @Post('')
  createChattingRoom(@Request() req) {
    return this.chattingRoomService.createChattingRoom(req.user);
  }

  // 채팅방 나가기
  @UseGuards(UserGuard)
  @Patch('/out/:chattingRoomId')
  outChattingRoom(
    @Request() req,
    @Param('chattingRoomId') chattingRoomId: number,
  ) {
    return this.chattingRoomService.outChattingRoom(req.user, chattingRoomId);
  }

  // 채팅방 삭제
  @UseGuards(UserGuard)
  @Delete('/:chattingRoomId')
  deleteChattingRoom(
    @Request() req,
    @Param('chattingRoomId') chattingRoomId: number,
  ) {
    return this.chattingRoomService.deleteChattingRoom(
      req.user,
      chattingRoomId,
    );
  }

  // 관리자 위임
  @UseGuards(UserGuard)
  @Patch('/:chattingRoomId/admin')
  changeAdmin(
    @Request() req,
    @Param('chattingRoomId') chattingRoomId: number,
    @Body() changeAdmin: ChangeAdmin,
  ) {
    return this.chattingRoomService.changeAdmin(
      req.user,
      chattingRoomId,
      changeAdmin.userId,
    );
  }

  // 채팅방 URL 원하는 유저한테 보내기
  @UseGuards(UserGuard)
  @Post('/:chattingRoomId/send-url')
  sendInviteUrl(
    @Request() req,
    @Param('chattingRoomId') chattingRoomId: number,
    @Body() inviteUser: InviteUser,
  ) {
    return this.chattingRoomService.sendInviteUrl(
      req.user,
      chattingRoomId,
      inviteUser.userId,
    );
  }

  // url 받아 접속한 멤버 채팅룸에 join
  @UseGuards(UserGuard)
  @Get('/:chattingRoomId/join')
  joinChattingRoom(
    @Request() req,
    @Param('chattingRoomId') chattingRoomId: number,
  ) {
    return this.chattingRoomService.joinChattingRoom(req.user, chattingRoomId);
  }
}
