import { Injectable, NotFoundException } from '@nestjs/common';
import { PinkmongRepository } from './pinkmong.repository';
import { Pinkmong } from './entities/pinkmong.entity';
import * as AWS from 'aws-sdk';

/**
 * PinkmongService
 *
 * 핑크몽의 생성, 조회, 수정, 삭제 등의 비즈니스 로직을 처리하는 서비스 클래스
 */
@Injectable()
export class PinkmongService {
  private s3: AWS.S3;

  constructor(
    private readonly pinkmongRepository: PinkmongRepository, // 레포지토리 주입
  ) {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_KEY || '',
      },
    });
  }

  /**
   * 모든 핑크몽 조회
   *
   * returns 데이터베이스에 저장된 모든 핑크몽 목록을 반환
   */
  async getAllPinkmongs(): Promise<{ message: string; pinkmongs: Pinkmong[] }> {
    const pinkmongs = await this.pinkmongRepository.findAll();
    return { message: '핑크몽 전체 정보 조회 성공', pinkmongs };
  }

  /**
   * 특정 핑크몽 조회
   *
   * param pinkmongId - 조회할 핑크몽의 ID
   * returns 해당 핑크몽 정보 반환
   * throws NotFoundException - 핑크몽이 존재하지 않을 경우 예외 발생
   */
  async getPinkmong(pinkmongId: number): Promise<Pinkmong> {
    const pinkmong = await this.pinkmongRepository.findById(pinkmongId);
    if (!pinkmong)
      throw new NotFoundException({ message: '핑크몽이 존재하지 않습니다.' });
    return pinkmong;
  }

  /**
   * 핑크몽 생성
   *
   * param body - 생성할 핑크몽 데이터
   * param file - 업로드된 파일
   * returns 생성 완료 메시지 반환
   */
  async createPinkmong(body: any, file: Express.Multer.File) {
    const uniqueFileName = `${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: uniqueFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const uploadResult = await this.s3.upload(params).promise();
    const pinkmong_image = uploadResult.Location;

    const pinkmongData = {
      ...body,
      pinkmong_image,
    };

    return await this.pinkmongRepository.createPinkmong(pinkmongData);
  }

  /**
   * 핑크몽 수정
   *
   * param pinkmongId - 수정할 핑크몽의 ID
   * param data - 수정할 데이터
   * returns 수정 완료 메시지 반환
   * throws NotFoundException - 핑크몽이 존재하지 않을 경우 예외 발생
   */
  async updatePinkmong(pinkmongId: number, data: Partial<Pinkmong>) {
    const pinkmong = await this.pinkmongRepository.findById(pinkmongId);
    if (!pinkmong)
      throw new NotFoundException({ message: '핑크몽이 존재하지 않습니다.' });

    Object.assign(pinkmong, data);
    await this.pinkmongRepository.updatePinkmong(pinkmong);
    return { message: '핑크몽 수정이 완료 되었습니다.' };
  }

  /**
   * 핑크몽 삭제
   *
   * param pinkmongId - 삭제할 핑크몽의 ID
   * returns 삭제 완료 메시지 반환
   * throws NotFoundException - 핑크몽이 존재하지 않을 경우 예외 발생
   */
  async deletePinkmong(pinkmongId: number): Promise<{ message: string }> {
    const pinkmong = await this.pinkmongRepository.findById(pinkmongId);
    if (!pinkmong)
      throw new NotFoundException({ message: '핑크몽이 존재하지 않습니다.' });

    await this.pinkmongRepository.deletePinkmong(pinkmong);
    return { message: '핑크몽 삭제가 완료 되었습니다.' };
  }
}
