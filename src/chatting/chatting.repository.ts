import { Injectable } from '@nestjs/common';
import { Chatting } from './entities/chatting.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { Chatmember } from '../chatmember/entities/chatmember.entity';

@Injectable()
export class ChattingRepository {
  constructor(
    @InjectRepository(Chatting)
    private readonly chattingRepository: Repository<Chatting>,
    @InjectRepository(Chatmember)
    private readonly chatmemberRepository: Repository<Chatmember>,
  ) {}

  async create(
    user: any,
    chatting_room_id: string,
    createChattingDto: CreateChattingDto,
  ) {
    const chatting = this.chattingRepository.create({
      user_id: user.id,
      chatting_room_id: Number(chatting_room_id),
      ...createChattingDto,
    });
    return await this.chattingRepository.save(chatting);
  }

  async findAll(chatting_room_id: string) {
    const results = await this.chattingRepository.find({
      where: { chatting_room_id: Number(chatting_room_id) },
      relations: ['user'],
      select: {
        user: {
          nickname: true,
        },
        message: true,
      },
    });

    return results.map((result) => ({
      message: result.message,
      nickname: result.user.nickname,
    }));
  }

  async isMember(userId: number, chattingRoomId: string): Promise<boolean> {
    try {
      console.log('멤버 확인 시도:', { userId, chattingRoomId });
      const member = await this.chatmemberRepository.findOne({
        where: {
          user_id: userId,
          chatting_room_id: parseInt(chattingRoomId),
        }
      });
      console.log('멤버 확인 결과:', member);
      return !!member;
    } catch (error) {
      console.error('멤버 확인 중 에러:', error);
      throw error;
    }
  }
}
