import { Injectable, NotFoundException } from '@nestjs/common';
import { PinkmongRepository } from './pinkmong.repository';
import { Pinkmong } from './entities/pinkmong.entity';
import { CreatePinkmongDto } from './dto/create-pinkmong.dto';
import { UpdatePinkmongDto } from './dto/update-pinkmong.dto';
import { S3Service } from '../s3/s3.service';
import { ValkeyService } from '../valkey/valkey.service';

@Injectable()
export class PinkmongService {
  constructor(
    private readonly pinkmongRepository: PinkmongRepository, // 레포지토리 주입
    private readonly s3Service: S3Service, // S3 서비스 주입
    private readonly valkeyService: ValkeyService, // 🔹 Valkey 조회용
  ) {}

  /**
   * 모든 핑크몽 조회
   */
  async getAllPinkmongs(): Promise<{ message: string; pinkmongs: Pinkmong[] }> {
    const cacheKey = `pinkmong:all`;

    // 발키에서 조회
    const cachedPinkmongs = await this.valkeyService.get<Pinkmong[]>(cacheKey);
    if (cachedPinkmongs)
      return { message: '핑크몽 전체 조회 성공', pinkmongs: cachedPinkmongs };

    // 발키에 없으면 DB에서 조회
    const pinkmongs = await this.pinkmongRepository.findAll();

    // 발키에 저장 (TTL 1시간)
    await this.valkeyService.set(cacheKey, pinkmongs, 6000);

    return { message: '핑크몽 전체 조회 성공', pinkmongs };
  }

  /**
   * 특정 핑크몽 조회
   */
  async getPinkmong(pinkmongId: number): Promise<Pinkmong> {
    const cacheKey = `pinkmong:${pinkmongId}`;

    // 발키에서 가져오기
    const cachedPinkmong = await this.valkeyService.get<Pinkmong>(cacheKey);
    if (cachedPinkmong) return cachedPinkmong; // 캐시에 있으면 바로 반환

    // 발키에 없으면 DB에서 가져오기
    const pinkmong = await this.pinkmongRepository.findById(pinkmongId);
    if (!pinkmong)
      throw new NotFoundException({ message: '핑크몽이 존재하지 않습니다.' });

    // 발키에 저장 (TTL 10분)
    await this.valkeyService.set(cacheKey, pinkmong, 600);

    return pinkmong;
  }

  /**
   * 핑크몽 생성
   */
  async createPinkmong(
    createPinkmongDto: CreatePinkmongDto,
    file: Express.Multer.File,
  ) {
    const pinkmong_image = await this.s3Service.uploadFile(file);

    const pinkmongData = {
      ...createPinkmongDto,
      pinkmong_image,
    };

    return this.pinkmongRepository.createPinkmong(pinkmongData);
  }

  /**
   * 핑크몽 수정
   */
  async updatePinkmong(
    pinkmongId: number,
    updatePinkmongDto: UpdatePinkmongDto,
    file?: Express.Multer.File, // 🔹 파일을 받을 수 있도록 추가
  ) {
    const pinkmong = await this.pinkmongRepository.findById(pinkmongId);
    if (!pinkmong)
      throw new NotFoundException({ message: '핑크몽이 존재하지 않습니다.' });

    // 🔹 파일이 존재하면 S3에 업로드 후 URL 업데이트
    let pinkmong_image = pinkmong.pinkmong_image; // 기존 이미지 유지
    if (file) {
      pinkmong_image = await this.s3Service.uploadFile(file);
    }

    const updatedData = {
      ...updatePinkmongDto,
      pinkmong_image, // 🔹 새 이미지가 있으면 업데이트
    };

    Object.assign(pinkmong, updatedData);
    await this.pinkmongRepository.updatePinkmong(pinkmong);
    return { message: '핑크몽 수정이 완료 되었습니다.' };
  }

  /**
   * 핑크몽 삭제
   */
  async deletePinkmong(pinkmongId: number): Promise<{ message: string }> {
    const pinkmong = await this.pinkmongRepository.findById(pinkmongId);
    if (!pinkmong)
      throw new NotFoundException({ message: '핑크몽이 존재하지 않습니다.' });

    await this.pinkmongRepository.deletePinkmong(pinkmong);
    return { message: '핑크몽 삭제가 완료 되었습니다.' };
  }
}
