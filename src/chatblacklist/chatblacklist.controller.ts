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
import { UpdateChatblacklistDto } from './dto/update-chatblacklist.dto';
import { UserGuard } from 'src/user/guards/user-guard';
import { AdminGuard } from 'src/user/guards/admin.guard';

@Controller('chatblacklist')
export class ChatblacklistController {
  constructor(private readonly chatblacklistService: ChatblacklistService) {}

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

  @Get()
  findAll() {
    return this.chatblacklistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatblacklistService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatblacklistService.remove(+id);
  }
}
