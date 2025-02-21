import { Injectable } from '@nestjs/common';
import { Chatting } from './entities/chatting.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { Chatmember } from 'src/chatmember/entities/chatmember.entity';

@Injectable()
export class ChattingRepository {
  constructor(
    @InjectRepository(Chatting)
    private chattingRepository: Repository<Chatting>,
    @InjectRepository(Chatmember)
    private chatmemberRepository: Repository<Chatmember>,
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
  async getUserNickname(user_id: any) {
    const user = await this.chattingRepository.findOne({
      where: { user_id: user_id },
      relations: ['user'], // User 엔티티와의 관계를 가져옵니다.
      select: {
        user: {
          nickname: true,
        },
      },
    });
    return user; // 유저의 닉네임 반환
  }
  async isMember(userId: number, chatting_room_id: string): Promise<boolean> {
    const member = await this.chatmemberRepository.findOne({
      where: {
        user_id: userId,
        chatting_room_id: Number(chatting_room_id),
      },
    });

    return !!member;
  }
}
