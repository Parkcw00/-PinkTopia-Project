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
import { UpdateChatmemberDto } from './dto/update-chatmember.dto';
import { UserGuard } from 'src/user/guards/user-guard';

@Controller('chatmember')
export class ChatmemberController {
  constructor(private readonly chatmemberService: ChatmemberService) {}

  @UseGuards(UserGuard)
  @Post()
  createChatmember(
    @Request() req,
    @Body() createChatmemberDto: CreateChatmemberDto,
  ) {
    const userId = req.user.id;
    return this.chatmemberService.createChatmember(userId, createChatmemberDto);
  }

  @Get()
  findAllChatMember() {
    return this.chatmemberService.findAllChatMember();
  }

  @Get(':id')
  findOneChatMember(@Param('id') id: string) {
    return this.chatmemberService.findOneChatMember(+id);
  }

  @Patch(':id')
  updateChatMember(
    @Param('id') id: string,
    @Body() updateChatmemberDto: UpdateChatmemberDto,
  ) {
    return this.chatmemberService.updateChatMember(+id, updateChatmemberDto);
  }

  @Delete(':id')
  deleteChatMember(@Param('id') id: string) {
    return this.chatmemberService.deleteChatMember(+id);
  }
}
