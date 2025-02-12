import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatmemberService } from './chatmember.service';
import { CreateChatmemberDto } from './dto/create-chatmember.dto';
import { UpdateChatmemberDto } from './dto/update-chatmember.dto';

@Controller('chatmember')
export class ChatmemberController {
  constructor(private readonly chatmemberService: ChatmemberService) {}

  @Post()
  create(@Body() createChatmemberDto: CreateChatmemberDto) {
    return this.chatmemberService.create(createChatmemberDto);
  }

  @Get()
  findAll() {
    return this.chatmemberService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatmemberService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatmemberDto: UpdateChatmemberDto) {
    return this.chatmemberService.update(+id, updateChatmemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatmemberService.remove(+id);
  }
}
