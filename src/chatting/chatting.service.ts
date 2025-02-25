import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { ChattingRepository } from './chatting.repository';
import { S3Service } from '../s3/s3.service';
import { UploadChattingDto } from './dto/create-upload-chatting.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chatting } from './entities/chatting.entity';

@Injectable()
export class ChattingService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly chattingCustomRepository: ChattingRepository,
  ) {}

  async create(
    user: any,
    chatting_room_id: string,
    createChattingDto: CreateChattingDto,
  ) {
    try {
      const isMember = await this.chattingCustomRepository.isMember(
        user.id,
        chatting_room_id,
      );

      if (!isMember) {
        throw new ForbiddenException('메시지 작성 권한이 없습니다.');
      }

      console.log(isMember);
      return this.chattingCustomRepository.create(
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

  async uploadFile(
    user: any,
    chatting_room_id: string,
    file: Express.Multer.File,
  ) {
    try {
      const isMember = await this.chattingCustomRepository.isMember(
        user.id,
        chatting_room_id,
      );

      if (!isMember) {
        throw new ForbiddenException('메시지 업로드 권한이 없습니다.');
      }

      const imageUrl = await this.s3Service.uploadFile(file);

      // 채팅 메시지 생성 DTO
      const createChattingDto: UploadChattingDto = {
        type: 'image',
        message: imageUrl,
      };

      // 채팅 테이블에 저장
      return this.chattingCustomRepository.create(
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
      throw new BadRequestException('메시지 업로드 중 오류가 발생했습니다.');
    }
  }

  async findAll(user: any, chatting_room_id: string) {
    const isMember = await this.chattingCustomRepository.isMember(
      user.id,
      chatting_room_id,
    );

    if (!isMember) {
      throw new ForbiddenException('채팅방에 접근 권한이 없습니다.');
    }

    return this.chattingCustomRepository.findAll(chatting_room_id);
  }
}
