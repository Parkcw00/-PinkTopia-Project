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
    return this.chattingRoomService.changeAdmin(req.user, chattingRoomId);
  }

  // // 멤버초대 URL생성
  // @UseGuards(UserGuard)
  // @Patch('/:chattingRoomId/invitation-url')
  // makeInviteUrl(@Request() req) {
  //   return this.chattingRoomService.makeInviteUrl(req.user);
  // }
}
