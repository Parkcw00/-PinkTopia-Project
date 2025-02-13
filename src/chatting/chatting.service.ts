import { Injectable } from '@nestjs/common';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { UpdateChattingDto } from './dto/update-chatting.dto';

@Injectable()
export class ChattingService {
  create(createChattingDto: CreateChattingDto) {
    return 'This action adds a new chatting';
  }

  findAll() {
    return `This action returns all chatting`;
  }
}
