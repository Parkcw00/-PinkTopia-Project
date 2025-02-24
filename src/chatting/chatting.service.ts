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
import { Repository } from 'typeorm';
import { Chatting } from './entities/chatting.entity';

@Injectable()
export class ChattingService {
  constructor(
    @InjectRepository(Chatting)
    private readonly chattingRepository: Repository<Chatting>,
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
      throw new BadRequestException('채팅 작성 중 오류가 발생했습니다.');
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

      // Redis에서 메시지 수 확인
      const messageCount = await this.valkeyService.llen(chatting_room_id);

      if (messageCount >= 5) {
        // 5개 이상일 경우 오래된 메시지를 DB에 저장
        for (let i = 0; i < messageCount - 5; i++) {
          const msg = await this.valkeyService.lpop(chatting_room_id); // Redis에서 오래된 메시지 가져오기
          if (msg) {
            // DB에 저장
            await this.chattingRepository.create(user, chatting_room_id, msg);
          }
        }
      }

      // 파일 업로드 후 URL 생성
      const imageUrl = await this.s3Service.uploadFile(file);
      // 채팅 메시지 생성 DTO

      const uploadChattingDto: UploadChattingDto = {
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

  async saveMessage(roomId: number, userId: number, message: string) {
    try {
      console.log('메시지 저장 시도:', { roomId, userId, message });

      const newMessage = this.chattingRepository.create({
        chatting_room_id: roomId,
        user_id: userId,
        message: message,
        type: 'text',
      });

      const savedMessage = await this.chattingRepository.save(newMessage);
      console.log('저장된 메시지:', savedMessage);

      return savedMessage;
    } catch (error) {
      console.error('메시지 저장 중 에러:', error);
      throw error;
    }
  }
}
