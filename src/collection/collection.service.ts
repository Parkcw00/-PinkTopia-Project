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

  async createCollection(
    createCollectionDto: CreateCollectionDto,
  ): Promise<{ message: string }> {
    const { user_id, pinkmong_id } = createCollectionDto;

    // 유저가 존재하는지 확인합니다.
    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new NotFoundException('해당 유저를 찾을 수 없습니다.');
    }

    // 핑크몽이 존재하는지 확인합니다.
    const pinkmong = await this.pinkmongRepository.findOne({
      where: { id: pinkmong_id },
    });
    if (!pinkmong) {
      throw new NotFoundException('해당 핑크몽을 찾을 수 없습니다.');
    }

    // 동일한 유저와 핑크몽 조합의 도감(컬렉션) 기록이 이미 존재하는지 확인합니다.
    const existingCollection = await this.collectionRepository.findOne({
      where: { user_id, pinkmong_id },
    });
    if (existingCollection) {
      throw new BadRequestException(
        `${pinkmong.name}은(는) 이미 도감에 등록되어 있습니다.`,
      );
    }

    // 새로운 도감 레코드를 생성합니다.
    const newCollection = this.collectionRepository.create({
      user,
      user_id,
      pinkmong,
      pinkmong_id,
    });
    await this.collectionRepository.save(newCollection);

    return {
      message: `${pinkmong.name}이(가) 도감에 등록되었습니다.`,
    };
  }

  async findCollections(): Promise<Collection[]> {
    // 핑크몽 테이블에서 등록되어있는 모든 핑크몽을 조회
    // 그리고 유저가 보유한 핑크몽
    // 유저와 핑크몽 관계도 같이 로드하여 전체 도감 데이터를 조회합니다.
    return await this.collectionRepository.find({
      relations: ['user', 'pinkmong'],
    });
  }

  /**
   * 특정 도감(컬렉션) 기록을 수정합니다.
   * 예를 들어, 도감 기록에 추가적인 메타 데이터나 변경사항을 반영할 때 사용합니다.
   *
   * @param collectionId - 수정할 도감 기록의 id
   * @param updateCollectionDto - 수정할 내용이 담긴 DTO
   * @returns 수정된 도감 레코드를 저장 후 성공 메시지를 반환합니다.
   * @throws NotFoundException - 해당 도감 기록이 존재하지 않는 경우
   */
  async updateCollection(
    collectionId: number,
    updateCollectionDto: UpdateCollectionDto,
  ): Promise<{ message: string }> {
    // 수정할 도감 레코드를 조회합니다.
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new NotFoundException(
        `id가 ${collectionId}인 도감 기록을 찾을 수 없습니다.`,
      );
    }

    // 전달받은 업데이트 데이터를 기존 도감 레코드에 병합합니다.
    Object.assign(collection, updateCollectionDto);
    await this.collectionRepository.save(collection);

    return { message: '도감 기록이 성공적으로 수정되었습니다.' };
  }

  /**
   * 특정 도감(컬렉션) 기록을 삭제합니다.
   * 예를 들어, 사용자가 도감 기록을 제거하고 싶을 때 사용합니다.
   *
   * @param collectionId - 삭제할 도감 기록의 id
   * @returns 삭제 완료 메시지를 반환합니다.
   * @throws NotFoundException - 해당 도감 기록이 존재하지 않는 경우
   */
  async deleteCollection(collectionId: number): Promise<{ message: string }> {
    // 삭제할 도감 레코드가 존재하는지 확인합니다.
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new NotFoundException(
        `id가 ${collectionId}인 도감 기록을 찾을 수 없습니다.`,
      );
    }

    // 도감 레코드를 데이터베이스에서 삭제합니다.
    await this.collectionRepository.remove(collection);

    return { message: '도감 기록이 삭제되었습니다.' };
  }
}
