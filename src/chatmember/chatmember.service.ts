import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateChatmemberDto } from './dto/create-chatmember.dto';
import { plainToInstance } from 'class-transformer';
import { Chatmember } from './entities/chatmember.entity';
import { ChatmemberRepository } from './chatmember.repository';
import { Messages } from 'src/common/messages';
import { ChattingRoomRepository } from 'src/chattingroom/chattingroom.repository';
import { ChatblacklistRepository } from 'src/chatblacklist/chatblacklist.repository';
import { UserRepository } from 'src/user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ChatmemberService {
  constructor(
    private readonly chatmemberRepository: ChatmemberRepository,
    private readonly userRepository: UserRepository,
    private readonly chattingRoomRepository: ChattingRoomRepository,
    private readonly chatblacklistRepository: ChatblacklistRepository,
    @InjectRepository(Chatmember)
    private chatmemberRepositoryTypeorm: Repository<Chatmember>,
  ) {}
  // 채팅멤버 생성
  async createChatmember(
    userId: number,
    createChatmemberDto: CreateChatmemberDto,
  ): Promise<Chatmember> {
    const { chatting_room_id, admin } = createChatmemberDto;

    const user = await this.userRepository.findUserId(userId);
    if (!user) {
      throw new NotFoundException(Messages.USER_NOT_FOUND);
    }
    const chattingRoom =
      await this.chattingRoomRepository.findChattingRoomById(chatting_room_id);
    if (!chattingRoom) {
      throw new NotFoundException(Messages.CHATROOM_NOT_FOUND);
    }

    // 블랙리스트 여부 확인
    const isBlacklisted =
      await this.chatblacklistRepository.findByUserIdAndChattingRoomId(
        userId,
        chatting_room_id,
      );
    if (isBlacklisted) {
      throw new ConflictException(Messages.USER_BLACKLISTED);
    }

    const chatMember =
      await this.chatmemberRepository.findByUserIdAndChattingRoomId(
        userId,
        chatting_room_id,
      );
    if (chatMember) {
      throw new ConflictException(Messages.CHATMEMBER_ALREADY_EXISTS);
    }

    const chatmember = plainToInstance(Chatmember, {
      user_id: userId,
      chatting_room_id,
      admin,
    });

    return await this.chatmemberRepository.createChatmember(chatmember);
  }

  // 채팅멤버 전체 조회
  async findAllChatMember() {
    const findChatmember = await this.chatmemberRepository.findAllChatmember();
    if (!findChatmember) {
      throw new NotFoundException(Messages.CHATMEMBER_NOT_FOUND);
    }
    // 필요한 정보만 선택하여 반환
    return findChatmember.map((member) => ({
      id: member.id,
      user_id: member.user_id,
      chatting_room_id: member.chatting_room_id,
    }));
  }

  // 채팅멤버 상세조회
  async findOneChatMember(chatmemberId: number) {
    const chatmember =
      await this.chatmemberRepository.findByChatmember(chatmemberId);
    if (!chatmember) {
      throw new NotFoundException(Messages.CHATMEMBER_NOT_FOUND);
    }

    // 필요한 사용자 정보만 선택하여 반환
    const userInfo = {
      id: chatmember.user.id,
      email: chatmember.user.email,
      nickname: chatmember.user.nickname,
      profile_image: chatmember.user.profile_image,
      birthday: chatmember.user.birthday,
    };

    return {
      ...chatmember,
      user: userInfo,
    };
  }

  // 채팅방 나가기
  async deleteChatMember(chatmemberId: number) {
    return this.chatmemberRepository.deleteChatmember(chatmemberId);
  }

  async findByRoomAndUser(chatting_room_id: number, user_id: number) {
    console.log('채팅 멤버 조회 시도:', { chatting_room_id, user_id });

    try {
      const member = await this.chatmemberRepositoryTypeorm
        .createQueryBuilder('chatmember')
        .leftJoinAndSelect('chatmember.user', 'user')
        .where('chatmember.chatting_room_id = :chatting_room_id', { chatting_room_id })
        .andWhere('chatmember.user_id = :user_id', { user_id })
        .getOne();

      console.log('조회된 멤버:', member);

      if (!member) {
        throw new NotFoundException('해당 채팅멤버가 존재하지 않습니다.');
      }

      return member;
    } catch (error) {
      console.error('채팅 멤버 조회 중 에러:', error);
      throw error;
    }
  }
}
