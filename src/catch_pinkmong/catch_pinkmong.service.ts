import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatchPinkmong } from 'src/catch_pinkmong/entities/catch_pinkmong.entity';
import { User } from 'src/user/entities/user.entity';
import { Pinkmong } from 'src/pinkmong/entities/pinkmong.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Collection } from 'src/collection/entities/collection.entity';
import { Item } from 'src/item/entities/item.entity';
import { ValkeyService } from 'src/valkey/valkey.service';

@Injectable()
export class CatchPinkmongService {
  private catchAttempts: Map<number, number> = new Map();

  constructor(
    @InjectRepository(CatchPinkmong)
    private catchPinkmongRepository: Repository<CatchPinkmong>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Pinkmong)
    private pinkmongRepository: Repository<Pinkmong>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
    private readonly valkeyService: ValkeyService,
  ) {}

  // 🔹 핑크몽 등장 (전투 시작 시 Valkey에 저장)
  async appearPinkmong(userId: number): Promise<{ message: string }> {
    // 1. 유저 조회
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['inventory'],
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    if (!user.inventory) {
      throw new NotFoundException('해당 유저의 인벤토리를 찾을 수 없습니다.');
    }

    // 2. 현재 인벤토리에 활성화된 핑크몽이 있는지 확인
    const existingCatch = await this.catchPinkmongRepository.findOne({
      where: { inventory_id: user.inventory.id },
    });

    if (existingCatch) {
      return { message: `이미 다른 핑크몽이 등장 중입니다!` };
    }

    // 3. 등급 결정 (전설: 5%, 희귀: 35%, 보통: 60%)
    const r = Math.random();
    let selectedGrade: string;
    if (r < 0.05) {
      selectedGrade = 'legendary';
    } else if (r < 0.05 + 0.35) {
      selectedGrade = 'rare';
    } else {
      selectedGrade = 'common';
    }

    // 4. 선택된 등급과 지역에 따른 핑크몽 선택
    const randomRegion = await this.pinkmongRepository
      .createQueryBuilder('pinkmong')
      .select('pinkmong.region_theme')
      .where('pinkmong.grade = :grade', { grade: selectedGrade })
      .orderBy('RANDOM()')
      .limit(1)
      .getRawOne();

    const selectedPinkmong = await this.pinkmongRepository
      .createQueryBuilder('pinkmong')
      .where('pinkmong.grade = :grade AND pinkmong.region_theme = :region', {
        grade: selectedGrade,
        region: randomRegion.region_theme,
      })
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();

    if (!selectedPinkmong) {
      throw new NotFoundException(
        `해당 등급(${selectedGrade})의 핑크몽을 찾을 수 없습니다.`,
      );
    }

    // 5. CatchPinkmong 생성 및 저장
    const catchPinkmong = this.catchPinkmongRepository.create({
      user,
      user_id: user.id,
      pinkmong_id: selectedPinkmong.id,
      inventory: user.inventory,
      inventory_id: user.inventory.id,
    });
    await this.catchPinkmongRepository.save(catchPinkmong);

    // 6. feeding 시도 횟수를 0으로 초기화
    this.catchAttempts.set(catchPinkmong.id, 0);

    // 7. Valkey에 전투 정보 저장 (30분 후 자동 삭제)
    const cacheKey = `pinkmong_battle:${userId}`;
    await this.valkeyService.set(
      cacheKey,
      { userId, pinkmongId: selectedPinkmong.id },
      1800,
    );

    return {
      message: `${selectedPinkmong.name}이(가) 등장했다! (등급: ${selectedGrade})`,
    };
  }

  // 🔹 먹이를 주고 잡는 로직 (포획 성공/실패 + 아이템 사용)
  async feeding(
    userId: number,
    itemId: number,
  ): Promise<{ message: string; success: boolean }> {
    const catchRecord = await this.catchPinkmongRepository.findOne({
      where: { user_id: userId },
      relations: ['user', 'pinkmong', 'inventory'],
    });

    if (!catchRecord) {
      throw new NotFoundException('해당 핑크몽을 잡을 수 없습니다.');
    }

    const { user, pinkmong, inventory } = catchRecord;

    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['inventory'],
    });

    if (!item || !item.inventory || item.inventory.id !== inventory.id) {
      throw new BadRequestException(
        '이 아이템은 현재 유저의 인벤토리에 속해 있지 않습니다.',
      );
    }

    if (item.count > 0) {
      item.count -= 1;
      await this.itemRepository.save(item);
    } else {
      throw new BadRequestException('해당 아이템의 수량이 부족합니다.');
    }

    const baseCatchRate = 0.1;
    const getChanceIncrease = { 2: 0.15, 3: 0.27, 4: 0.35 };
    const bonus = getChanceIncrease[item.id] || 0;
    const finalCatchRate = baseCatchRate + bonus;

    if (Math.random() > finalCatchRate) {
      const attempts = (this.catchAttempts.get(catchRecord.id) || 0) + 1;
      this.catchAttempts.set(catchRecord.id, attempts);

      if (attempts < 5) {
        return {
          message: `핑크몽 포획 실패! 남은 기회: ${5 - attempts}`,
          success: false,
        };
      } else {
        await this.catchPinkmongRepository.remove(catchRecord);
        this.catchAttempts.delete(catchRecord.id);
        await this.valkeyService.del(`pinkmong_battle:${userId}`);
        return { message: '핑크몽이 도망갔습니다!', success: false };
      }
    }

    await this.catchPinkmongRepository.remove(catchRecord);
    await this.valkeyService.del(`pinkmong_battle:${userId}`);

    return { message: `${pinkmong.name}을 잡았습니다!`, success: true };
  }

  // 🔹 유저가 도망 (전투 종료 시 Valkey에서 삭제)
  async giveup(userId: number): Promise<{ message: string; success: boolean }> {
    const catchRecord = await this.catchPinkmongRepository.findOne({
      where: { user_id: userId },
      relations: ['pinkmong'],
    });

    if (!catchRecord) {
      throw new NotFoundException(
        '해당 유저의 몬스터 등장 기록을 찾을 수 없습니다.',
      );
    }

    await this.catchPinkmongRepository.remove(catchRecord);
    this.catchAttempts.delete(catchRecord.id);
    await this.valkeyService.del(`pinkmong_battle:${userId}`);

    return { message: `성공적으로 도망쳤습니다!`, success: false };
  }
}
