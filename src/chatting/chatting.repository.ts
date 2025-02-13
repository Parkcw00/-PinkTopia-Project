import { Injectable } from '@nestjs/common';
import { Chatting } from './entities/chatting.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChattingDto } from './dto/create-chatting.dto';

@Injectable()
export class ChattingRepository {
  constructor(
    @InjectRepository(Chatting)
    private chattingRepository: Repository<Chatting>,
  ) {}

  async create(chatting_room_id: string, createChattingDto: CreateChattingDto) {
    const chatting = this.chattingRepository.create({
      chatting_room_id: Number(chatting_room_id),
      ...createChattingDto,
    });
    return await this.chattingRepository.save(chatting);
  }

  async findAll(chatting_room_id: string) {
    return await this.chattingRepository.find({
      where: { chatting_room_id: Number(chatting_room_id) },
    });
  }
}
