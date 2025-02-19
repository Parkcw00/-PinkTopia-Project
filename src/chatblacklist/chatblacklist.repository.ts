import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chatblacklist } from './entities/chatblacklist.entity';
import { UserRepository } from 'src/user/user.repository';
// import { ChattingRoomRepository } from 'src/chattingroom/chattingroom.repository';

@Injectable()
export class ChatblacklistRepository {
  constructor(
    @InjectRepository(Chatblacklist)
    private chatblacklistRepository: Repository<Chatblacklist>,
    private userRepository: UserRepository,
    // private chattingRoomRepository: ChattingRoomRepository,
  ) {}
  // 채팅방 블랙리스트 생성
  async createChatblacklist(chatblacklist: Chatblacklist) {
    return this.chatblacklistRepository.save(chatblacklist);
  }
  // 유저 아이디 조회
  async findByUserId(userId: number) {
    return this.userRepository.findId(userId);
  }

  // 채팅방 아이디 조회
  // async findByChattingRoomId(chattingRoomId: number) {
  //   return this.chatblacklistRepository.find({
  //     where: { chatting_room_id: chattingRoomId },
  //   });
  // }

  // 채팅방 블랙리스트 조회
  async findByChatblacklist(id: number) {
    return this.chatblacklistRepository.findOne({
      where: { id },
    });
  }

  // 채팅방 블랙리스트 전체 조회
  async findAllChatblacklist() {
    return this.chatblacklistRepository.find();
  }

  // 채팅방 블랙리스트 삭제
  async deleteChatblacklist(id: number) {
    return this.chatblacklistRepository.delete(id);
  }
}
