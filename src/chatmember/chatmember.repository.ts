import { Repository } from 'typeorm';
import { Chatmember } from './entities/chatmember.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ChattingRoomRepository } from 'src/chattingroom/chattingroom.repository';
@Injectable()
export class ChatmemberRepository {
  constructor(
    @InjectRepository(Chatmember)
    private chatmemberRepository: Repository<Chatmember>,
    private readonly chattingRoomRepository: ChattingRoomRepository,
  ) {}
  // 유저 아이디 조회
  async findByUserId(userId: number) {
    return this.chatmemberRepository.find({ where: { user_id: userId } });
  }

  // 채팅멤버 생성
  async createChatmember(chatmember: Chatmember) {
    return this.chatmemberRepository.save(chatmember);
  }

  // 채팅멤버 삭제
  async deleteChatmember(id: number) {
    return this.chatmemberRepository.delete(id);
  }

  // 관리자 조회
  async findByAdmin(admin: boolean) {
    return this.chatmemberRepository.find({ where: { admin: admin } });
  }

  // 채팅멤버 조회
  async findByChatmember(id: number) {
    return this.chatmemberRepository.findOne({
      where: { id: id },
      relations: ['user'],
    });
  }

  // 채팅멤버 전체 조회
  async findAllChatmember() {
    return this.chatmemberRepository.find();
  }

  // 특정 채팅방 내에서 유저 조회
  async findByUserIdAndChattingRoomId(userId: number, roomId: number) {
    return this.chatmemberRepository
      .createQueryBuilder('chatmember')
      .leftJoinAndSelect('chatmember.user', 'user')
      .where('chatmember.user_id = :userId', { userId })
      .andWhere('chatmember.chatting_room_id = :roomId', { roomId })
      .getOne();
  }
}
