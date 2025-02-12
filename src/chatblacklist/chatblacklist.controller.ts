import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatblacklistService } from './chatblacklist.service';
import { CreateChatblacklistDto } from './dto/create-chatblacklist.dto';
import { UpdateChatblacklistDto } from './dto/update-chatblacklist.dto';

@Controller('chatblacklist')
export class ChatblacklistController {
  constructor(private readonly chatblacklistService: ChatblacklistService) {}

  @Post()
  create(@Body() createChatblacklistDto: CreateChatblacklistDto) {
    return this.chatblacklistService.create(createChatblacklistDto);
  }

  @Get()
  findAll() {
    return this.chatblacklistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatblacklistService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatblacklistDto: UpdateChatblacklistDto) {
    return this.chatblacklistService.update(+id, updateChatblacklistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatblacklistService.remove(+id);
  }
}
