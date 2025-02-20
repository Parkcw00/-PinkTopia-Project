import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chatmember } from 'src/chatmember/entities/chatmember.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ChattingRoom } from './entities/chattingroom.entity';

@Injectable()
export class ChattingRoomRepository {
  constructor(
    @InjectRepository(ChattingRoom)
    private chattingRoomrepository: Repository<ChattingRoom>,
    @InjectRepository(Chatmember)
    private chatMemberRepository: Repository<Chatmember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // 채팅방 만들기
  async createChattingRoom() {
    const newChattingRoom = this.chattingRoomrepository.create();
    console.log(newChattingRoom);
    return await this.chattingRoomrepository.save(newChattingRoom);
  }

  // 멤버 추가(admin)
  async addChatMember(chatting_room_id: number, user_id: number) {
    return await this.chatMemberRepository.save({
      chatting_room_id,
      user_id,
      admin: true,
    });
  }

  // 채팅방 멤버인지 확인
  async findChatMember(chatting_room_id: number, user_id: number) {
    return await this.chatMemberRepository.findOne({
      where: {
        chatting_room_id,
        user_id,
      },
    });
  }

  // 채팅방 전체 멤버 조회
  async findAllChatMembers(chatting_room_id: number) {
    return await this.chatMemberRepository.find({
      where: { chatting_room_id },
    });
  }

  // 어드민 권한 부여
  async getAdmin(chatting_room_id: number, user_id: number) {
    return await this.chatMemberRepository.update(
      { chatting_room_id, user_id },
      { admin: true },
    );
  }

  // 어드민 권한 삭제
  async deleteAdmin(chatting_room_id: number, user_id: number) {
    return await this.chatMemberRepository.update(
      { chatting_room_id, user_id },
      { admin: false },
    );
  }

  // 채팅방 멤버 삭제
  async deleteChatMember(chatting_room_id: number, user_id: number) {
    return await this.chatMemberRepository.delete({
      chatting_room_id,
      user_id,
    });
  }

  // 채팅방 삭제
  async deleteChattingRoom(id: number) {
    return await this.chattingRoomrepository.delete({ id });
  }

  // 유저 조회
  async findId(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  // 채팅방 확인
  async findChattingRoom(id: number) {
    return await this.chattingRoomrepository.findOne({ where: { id } });
  }

  // 채팅방 멤버 추가(not admin)
  async addChatMemberNotAdmin(chatting_room_id: number, user_id: number) {
    return await this.chatMemberRepository.save({
      chatting_room_id,
      user_id,
      admin: false,
    });
  }
}
