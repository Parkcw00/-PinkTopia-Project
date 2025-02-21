import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { ChattingRepository } from './chatting.repository';
import { S3Service } from '../s3/s3.service';
import { UploadChattingDto } from './dto/create-upload-chatting.dto';
import { ValkeyService } from 'src/valkey/valkey.service';

@Injectable()
export class ChattingService {
  constructor(
    private readonly chattingRepository: ChattingRepository,
    private readonly s3Service: S3Service,
    private readonly valkeyService: ValkeyService,
  ) {}

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
      const message = {
        ...createChattingDto,
        user_id: user.id,
      };

      // 새로운 메시지를 Redis에 저장
      await this.valkeyService.rpush(chatting_room_id, JSON.stringify(message));

      return createChattingDto; // 또는 원하는 응답 형태로 변경
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
      const isMember = await this.chattingRepository.isMember(
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
      const message: any = {
        message: uploadChattingDto.message,
        user_id: user.id,
      };
      console.log(message);
      // 새로운 파일 메시지를 Redis에 저장
      await this.valkeyService.rpush(chatting_room_id, JSON.stringify(message));

      return uploadChattingDto;
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
    const isMember = await this.chattingRepository.isMember(
      user.id,
      chatting_room_id,
    );

    if (!isMember) {
      throw new ForbiddenException('채팅방에 접근 권한이 없습니다.');
    }

    // Redis에서 메시지 가져오기
    const redisMessages = await this.valkeyService.lrange(
      chatting_room_id,
      0,
      -1,
    );

    // DB에서 메시지 가져오기
    const dbMessages = await this.chattingRepository.findAll(chatting_room_id);

    // Redis 메시지를 객체로 변환
    const parsedRedisMessages = redisMessages.map((msg) => JSON.parse(msg));

    // 배열의 각 메시지에 대해 유저 닉네임을 가져오기
    const messagesWithNicknames = await Promise.all(
      parsedRedisMessages.map(async (msg) => {
        const nickname = await this.chattingRepository.getUserNickname(
          msg.user_id,
        );
        return { message: msg.message, nickname: nickname?.user.nickname }; // 메시지에 닉네임 추가
      }),
    );

    // Redis 메시지와 DB 메시지를 통합
    const allMessages = [...dbMessages, ...messagesWithNicknames];

    return allMessages; // 통합된 메시지를 반환
  }
}
