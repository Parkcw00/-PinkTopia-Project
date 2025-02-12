import { Injectable } from '@nestjs/common';
import { CreateChatblacklistDto } from './dto/create-chatblacklist.dto';
import { UpdateChatblacklistDto } from './dto/update-chatblacklist.dto';

@Injectable()
export class ChatblacklistService {
  create(createChatblacklistDto: CreateChatblacklistDto) {
    return 'This action adds a new chatblacklist';
  }

  findAll() {
    return `This action returns all chatblacklist`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatblacklist`;
  }

  update(id: number, updateChatblacklistDto: UpdateChatblacklistDto) {
    return `This action updates a #${id} chatblacklist`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatblacklist`;
  }
}
