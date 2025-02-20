import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateChatblacklistDto } from './dto/create-chatblacklist.dto';
import { ChatblacklistRepository } from './chatblacklist.repository';
import { UserRepository } from 'src/user/user.repository';
import { Messages } from 'src/common/messages';
import { plainToInstance } from 'class-transformer';
import { Chatblacklist } from './entities/chatblacklist.entity';
import { ChattingRoomRepository } from 'src/chattingroom/chattingroom.repository';

@Injectable()
export class ChatblacklistService {
  constructor(
    private readonly chatblacklistRepository: ChatblacklistRepository,
    private readonly userRepository: UserRepository,
    private readonly chattingRoomRepository: ChattingRoomRepository,
  ) {}
  // 채팅방 블랙리스트 생성
  async createChatblacklist(
    userId: number,
    createChatblacklistDto: CreateChatblacklistDto,
  ) {
    const { chatting_room_id } = createChatblacklistDto;

    const user = await this.userRepository.findId(userId);
    if (!user) {
      throw new NotFoundException(Messages.USER_NOT_FOUND);
    }

    const chackuser =
      await this.chatblacklistRepository.findByUserIdAndChattingRoomId(
        userId,
        chatting_room_id,
      );
    if (chackuser) {
      throw new ConflictException(Messages.BLACKLIST_ALREADY_EXISTS);
    }

    const chattingRoom =
      await this.chattingRoomRepository.findChattingRoomById(chatting_room_id);
    if (!chattingRoom) {
      throw new NotFoundException(Messages.CHATROOM_NOT_FOUND);
    }
    const chatblacklist = plainToInstance(Chatblacklist, {
      user_id: createChatblacklistDto.user_id,
      chatting_room_id: createChatblacklistDto.chatting_room_id,
    });
    return this.chatblacklistRepository.createChatblacklist(chatblacklist);
  }

  // 채팅방 블랙리스트 전체 조회
  async findAll() {
    const findChatblacklist =
      await this.chatblacklistRepository.findAllChatblacklist();
    if (!findChatblacklist) {
      throw new NotFoundException(Messages.BLACKLIST_NOT_FOUND);
    }
    return findChatblacklist;
  }

  // 채팅방 블랙리스트 조회
  async findOne(id: number) {
    const findChatblacklist =
      await this.chatblacklistRepository.findByChatblacklist(id);
    if (!findChatblacklist) {
      throw new NotFoundException(Messages.BLACKLIST_NOT_FOUND);
    }
    return findChatblacklist;
  }

  // 채팅방 블랙리스트 해제
  async remove(id: number) {
    const findChatblacklist =
      await this.chatblacklistRepository.findByChatblacklist(id);
    if (!findChatblacklist) {
      throw new NotFoundException(Messages.BLACKLIST_NOT_FOUND);
    }
    return this.chatblacklistRepository.deleteChatblacklist(id);
  }
}
