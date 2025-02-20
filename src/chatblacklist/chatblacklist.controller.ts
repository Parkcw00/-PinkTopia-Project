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
import { ChatblacklistService } from './chatblacklist.service';
import { CreateChatblacklistDto } from './dto/create-chatblacklist.dto';
import { UserGuard } from 'src/user/guards/user-guard';
import { AdminGuard } from 'src/user/guards/admin.guard';
import { ApiOperation } from '@nestjs/swagger';
@Controller('chatblacklist')
export class ChatblacklistController {
  constructor(private readonly chatblacklistService: ChatblacklistService) {}

  @ApiOperation({ summary: '채팅 블랙리스트 생성' })
  @UseGuards(UserGuard, AdminGuard)
  @Post()
  create(
    @Request() req,
    @Body() createChatblacklistDto: CreateChatblacklistDto,
  ) {
    const userId = req.user.id;
    return this.chatblacklistService.createChatblacklist(
      userId,
      createChatblacklistDto,
    );
  }

  @ApiOperation({ summary: '채팅 블랙리스트 전체 조회' })
  @UseGuards(UserGuard, AdminGuard)
  @Get()
  findAll() {
    return this.chatblacklistService.findAll();
  }

  @ApiOperation({ summary: '채팅 블랙리스트 조회' })
  @UseGuards(UserGuard, AdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatblacklistService.findOne(+id);
  }

  @ApiOperation({ summary: '채팅 블랙리스트 삭제' })
  @UseGuards(UserGuard, AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatblacklistService.remove(+id);
  }
}
