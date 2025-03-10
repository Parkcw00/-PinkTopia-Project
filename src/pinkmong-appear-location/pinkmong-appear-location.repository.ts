import { Injectable } from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PinkmongAppearLocation } from 'src/pinkmong-appear-location/entities/pinkmong-appear-location.entity';
import { CreatePinkmongAppearLocationDto } from './dto/create-pinkmong-appear-location.dto';
import { UpdatePinkmongAppearLocationDto } from './dto/update-pinkmong-appear-location.dto';

@Injectable()
export class PinkmongAppearLocationRepository {
  constructor(
    @InjectRepository(PinkmongAppearLocation)
    private readonly repo: Repository<PinkmongAppearLocation>,
  ) {}

  // ✅ 추가된 코드: Valkey 저장용 데이터 조회
  async findAllForValkey(): Promise<PinkmongAppearLocation[]> {
    return await this.repo.find({
      where: { deleted_at: IsNull() }, // ✅ 삭제되지 않은 데이터만 조회
    });
  }
  // 새로운 위치 생성 후 DB 저장
  async createLocation(
    createDto: CreatePinkmongAppearLocationDto,
  ): Promise<PinkmongAppearLocation> {
    // DTO로부터 엔티티 생성
    const newLocation = this.repo.create(createDto);
    // 생성된 엔티티 DB 저장
    return await this.repo.save(newLocation);
  }

  // 전체 위치 조회
  async findAll(): Promise<PinkmongAppearLocation[]> {
    return await this.repo.find();
  }

  // ID로 위치 조회
  async findById(id: number): Promise<PinkmongAppearLocation | null> {
    return await this.repo.findOne({ where: { id } });
  }
  // 이메일로 타이틀 조회 -> id반환
  async findOneByEmail(
    user_email: string,
  ): Promise<{ id: number } | undefined> {
    console.log('R - 타이틀로 id 가져오기');
    const id = await this.repo.findOne({
      where: { title: user_email },
      select: { id: true },
    });
    console.log('있는 id : ', id);
    return id ?? undefined;
  }

  // 위치 삭제
  async deleteLocation(id: number): Promise<void> {
    console.log(`R - ${id}번 삭제`, id);
    await this.repo.delete(id);
  }

  // 위치 업데이트
  async updateLocation(
    id: number,
    updateDto: UpdatePinkmongAppearLocationDto,
  ): Promise<PinkmongAppearLocation | null> {
    // 업데이트 전 기존 엔티티 조회
    const existingLocation = await this.repo.findOne({ where: { id } });
    if (!existingLocation) {
      return null;
    }

    // DTO의 값으로 기존 엔티티 병합 (Object.assign 사용)
    const updatedLocation = Object.assign(existingLocation, updateDto);
    // 업데이트된 엔티티 DB 저장
    return await this.repo.save(updatedLocation);
  }
}
