import { Injectable } from '@nestjs/common';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { ChattingRepository } from './chatting.repository';

@Injectable()
export class ChattingService {
  constructor(private readonly chattingRepository: ChattingRepository) {}

  create(chatting_room_id: string, createChattingDto: CreateChattingDto) {
    return this.chattingRepository.create(chatting_room_id, createChattingDto);
  }

  findAll(chatting_room_id: string) {
    return this.chattingRepository.findAll(chatting_room_id);
  }
}
