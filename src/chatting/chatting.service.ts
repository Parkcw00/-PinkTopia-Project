import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateChattingDto } from './dto/create-chatting.dto';
import { ChattingRepository } from './chatting.repository';
import * as AWS from 'aws-sdk';
import { awsConfig } from '../../aws.config';
import { UploadChattingDto } from './dto/create-upload-chatting.dto';

@Injectable()
export class ChattingService {
  private s3: AWS.S3;
  constructor(private readonly chattingRepository: ChattingRepository) {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_KEY || '',
      },
    });
  }

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

      const uniqueFileName = `${Date.now()}-${file.originalname}`;

      const params = {
        Bucket: awsConfig.bucketName || '',
        Key: uniqueFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      const uploadResult = await this.s3.upload(params).promise();
      const imageUrl = uploadResult.Location;

      // 채팅 메시지 생성 DTO
      const createChattingDto: UploadChattingDto = {
        type: 'image',
        message: imageUrl,
      };

      // 채팅 테이블에 저장
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

    return this.chattingRepository.findAll(chatting_room_id);
  }
}
