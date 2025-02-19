import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChatmemberDto } from './dto/create-chatmember.dto';
import { plainToInstance } from 'class-transformer';
import { Chatmember } from './entities/chatmember.entity';
import { ChatmemberRepository } from './chatmember.repository';
import { UserRepository } from 'src/user/user.repository';
// import { ChattingRoomRepository } from 'src/chattingroom/chattingroom.repository';
import { Messages } from 'src/common/messages';

@Injectable()
export class ChatmemberService {
  constructor(
    private readonly chatmemberRepository: ChatmemberRepository,
    private readonly userRepository: UserRepository,
    // private readonly chattingRoomRepository: ChattingRoomRepository,
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

    // const chattingRoom =
    //   await this.chatmemberRepository.findByChattingRoomId(chatting_room_id);
    // if (!chattingRoom) {
    //   throw new NotFoundException(Messages.CHATROOM_NOT_FOUND);
    // }

    const chatmember = plainToInstance(Chatmember, {
      user_id: userId,
      chatting_room_id,
      admin,
    });
    return this.chatmemberRepository.createChatmember(chatmember);
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
      chatting_room_id: member.chatting_room_id,
    }));
  }

  // 채팅멤버 조회
  async findOneChatMember(chatmemberId: number): Promise<Chatmember> {
    const chatmember =
      await this.chatmemberRepository.findByChatmember(chatmemberId);
    if (!chatmember) {
      throw new NotFoundException(Messages.CHATMEMBER_NOT_FOUND);
    }
    return chatmember;
  }

  // // 채팅멤버 수정
  // async updateChatMember(
  //   chatmemberId: number,
  //   updateChatmemberDto: UpdateChatmemberDto,
  // ) {
  //   return this.chatmemberRepository.updateChatmember(
  //     chatmemberId,
  //     updateChatmemberDto,
  //   );
  // }

  // 채팅멤버 삭제
  async deleteChatMember(chatmemberId: number) {
    return this.chatmemberRepository.deleteChatmember(chatmemberId);
  }
}
