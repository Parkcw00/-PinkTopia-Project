import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { ChattingRepository } from './chatting.repository';

@Injectable()
export class ChattingService {
  constructor(private readonly chattingRepository: ChattingRepository) {}

  async create(
    user: any,
    chatting_room_id: string,
    createChattingDto: CreateChattingDto,
  ) {
    try {
      const isMember = await this.chattingRepository.isMember(
        user.id,
        chatting_room_id,
      );

      if (!isMember) {
        throw new ForbiddenException('메시지 작성 권한이 없습니다.');
      }

      console.log(isMember);
      return this.chattingRepository.create(
        user,
        chatting_room_id,
        createChattingDto,
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.log(error);
      throw new BadRequestException('댓글 작성 중 오류가 발생했습니다.');
    }
  }

  async findAll(user: any, chatting_room_id: string) {
    const isMember = await this.chattingRepository.isMember(
      user.id,
      chatting_room_id,
    );

    if (!isMember) {
      throw new ForbiddenException('채팅방에 접근 권한이 없습니다.');
    }

    return this.chattingRepository.findAll(chatting_room_id);
  }
}
