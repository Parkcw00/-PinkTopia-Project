import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Pinkmong } from 'src/pinkmong/entities/pinkmong.entity';

@Injectable()
export class CollectionService {
  constructor(
    // 컬렉션 엔티티에 대한 Repository 주입
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,

    // 유저 엔티티에 대한 Repository 주입 (유저 존재 여부 확인용)
    @InjectRepository(User)
    private userRepository: Repository<User>,

    // 핑크몽 엔티티에 대한 Repository 주입 (핑크몽 존재 여부 확인용)
    @InjectRepository(Pinkmong)
    private pinkmongRepository: Repository<Pinkmong>,
  ) {}
  /**
   * 인증된 유저의 컬렉션에서 핑크몽 정보만 조회합니다.
   * @param userId 조회할 유저의 ID
   * @returns 해당 유저가 등록한 핑크몽 목록 (유저 정보는 제외)
   */
  async findCollectionsByUser(userId: number): Promise<Pinkmong[]> {
    // 유저 존재 여부 확인 (선택 사항)
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }

    // user_id가 일치하는 컬렉션만 조회 (핑크몽 관계만 로드)
    const collections = await this.collectionRepository.find({
      where: { user_id: userId },
      relations: ['pinkmong'],
    });

    // 컬렉션에서 핑크몽 정보만 추출하여 반환
    return collections.map((collection) => collection.pinkmong);
  }
  async deleteCollection(collectionId: number): Promise<{ message: string }> {
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new NotFoundException(
        `id가 ${collectionId}인 도감 기록을 찾을 수 없습니다.`,
      );
    }

    await this.collectionRepository.remove(collection);
    return { message: '도감 기록이 삭제되었습니다.' };
  }

  async getCollectionStatus(userId: number) {
    // 1. 모든 핑크몽 데이터 조회
    const allPinkmongs = await this.pinkmongRepository.find({
      order: { id: 'ASC' },
    });

    // 2. 유저가 수집한 핑크몽 조회
    const userCollections = await this.collectionRepository.find({
      where: { user_id: userId },
      relations: ['pinkmong'],
    });

    // 3. 도감 상태 매핑
    const collectionStatus = allPinkmongs.map((pinkmong) => {
      const collected = userCollections.some(
        (col) => col.pinkmong_id === pinkmong.id,
      );
      return {
        id: pinkmong.id,
        name: collected ? pinkmong.name : '???',
        pinkmong_image: collected
          ? pinkmong.pinkmong_image
          : '/images/unknown.png',
        grade: collected ? pinkmong.grade : '???',
        region_theme: collected ? pinkmong.region_theme : '???',
        explain: collected
          ? pinkmong.explain
          : '아직 발견하지 못한 핑크몽입니다.',
        isCollected: collected,
      };
    });

    return { data: collectionStatus }; // 데이터를 객체로 감싸서 반환
  }
}
