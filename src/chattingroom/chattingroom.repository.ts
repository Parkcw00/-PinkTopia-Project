import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chatmember } from 'src/chatmember/entities/chatmember.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ChattingRoom } from './entities/chattingroom.entity';
import { IsNull } from 'typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ChattingRoomRepository {
  constructor(
    @InjectRepository(ChattingRoom)
    private chattingRoomrepository: Repository<ChattingRoom>,
    @InjectRepository(Chatmember)
    private chatMemberRepository: Repository<Chatmember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  // 채팅방 만들기
  async createChattingRoom(createChattingRoomDto) {
      const newChattingRoom = this.chattingRoomrepository.create({
        ...createChattingRoomDto,
      });
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
    console.log('멤버 조회 시도:', { chatting_room_id, user_id });
    
    try {
      const member = await this.chatMemberRepository
        .createQueryBuilder('chatmember')
        .where('chatmember.chatting_room_id = :chatting_room_id', { chatting_room_id })
        .andWhere('chatmember.user_id = :user_id', { user_id })
        .leftJoinAndSelect('chatmember.user', 'user')
        .getOne();

      console.log('조회된 멤버:', member);
      return member;
    } catch (error) {
      console.error('멤버 조회 중 에러:', error);
      throw error;
    }
  }

  async findChatMemberByUserId(user_id: number) {
    return await this.chatMemberRepository.find({
      where: { user_id },
    });
  }

  // 채팅방 전체 멤버 조회
  async findAllChatMembers(chatting_room_id: number) {
    return await this.chatMemberRepository
      .createQueryBuilder('chatmember')
      .where('chatmember.chatting_room_id = :chatting_room_id', { chatting_room_id })
      .leftJoinAndSelect('chatmember.user', 'user')
      .getMany();
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

  // 채팅방 조회
  async findChattingRoom(id: number) {
    return await this.chattingRoomrepository.find();
  }

  // 특정 채팅방 조회
  async findChattingRoomById(id: number) {
    return await this.chattingRoomrepository.findOne({ where: { id } });
  }

  // 유저 조회
  async findId(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  // 채팅방 확인
  async checkChattingRoom(id: number) {
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

  // 닉네임으로 사용자 찾기 메서드 추가
  async findByNickname(nickname: string) {
    const user = await this.dataSource
      .getRepository(User)
      .findOne({
        where: { nickname }
      });
    return user;
  }
}
