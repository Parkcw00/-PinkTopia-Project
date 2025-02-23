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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateChattingRoomDto } from './dto/create-chattingroom.dto'

@ApiTags('채팅방 기능')
@Controller('chattingroom')
export class ChattingRoomController {
  constructor(private readonly chattingRoomService: ChattingRoomService) {}

  // 채팅방 생성
  @ApiOperation({ summary: '채팅방 생성' })
  @UseGuards(UserGuard)
  @Post('')
  createChattingRoom(@Request() req, @Body() CreateChattingRoomDto: CreateChattingRoomDto) {
    return this.chattingRoomService.createChattingRoom(req.user, CreateChattingRoomDto);
  }

  // 채팅방 조회
  @UseGuards(UserGuard)
  @Get('')
  getChattingRoom(@Request() req) {
    return this.chattingRoomService.getChattingRoom(req.user);
  }

  // 채팅방 나가기
  @ApiOperation({ summary: '채팅방 나가기' })
  @UseGuards(UserGuard)
  @Patch('/out/:chattingRoomId')
  outChattingRoom(
    @Request() req,
    @Param('chattingRoomId') chattingRoomId: number,
  ) {
    return this.chattingRoomService.outChattingRoom(req.user, chattingRoomId);
  }

  // 채팅방 삭제
  @ApiOperation({ summary: '채팅방 삭제' })
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
  @ApiOperation({ summary: '관리자 위임' })
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
  @ApiOperation({ summary: '채팅방 URl 원하는 유저 메일로 전송' })
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

  // url 받아 접속한 멤버 채팅방에 join
  @ApiOperation({ summary: 'URL 받아 접속한 멤버 채팅방에 JOIN' })
  @UseGuards(UserGuard)
  @Get('/:chattingRoomId/join')
  joinChattingRoom(
    @Request() req,
    @Param('chattingRoomId') chattingRoomId: number,
  ) {
    return this.chattingRoomService.joinChattingRoom(req.user, chattingRoomId);
  }

  // 채팅방 멤버 확인 API
  @UseGuards(UserGuard)
  @Get(':chattingRoomId/chatmember')
  async checkChatMember(
    @Request() req,
    @Param('chattingRoomId') chattingRoomId: string
  ) {
    try {
      console.log('멤버 확인 요청:', {
        userId: req.user.id,
        chattingRoomId: parseInt(chattingRoomId)
      });

      const result = await this.chattingRoomService.checkChatMember(
        req.user.id,
        parseInt(chattingRoomId)
      );

      console.log('멤버 확인 결과:', result);
      return result;
    } catch (error) {
      console.error('멤버 확인 중 에러:', error);
      throw error;
    }
  }
}
