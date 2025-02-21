import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCatchPinkmongDto } from './dto/create-catch_pinkmong.dto';
import { UpdateCatchPinkmongDto } from './dto/update-catch_pinkmong.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CatchPinkmong } from 'src/catch_pinkmong/entities/catch_pinkmong.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Pinkmong } from 'src/pinkmong/entities/pinkmong.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Collection } from 'src/collection/entities/collection.entity';
import { Item } from 'src/item/entities/item.entity';
import { ValkeyService } from 'src/valkey/valkey.service';

@Injectable()
export class CatchPinkmongService {
  // feeding 시도 횟수를 기록하기 위한 in-memory Map
  // 키: catchPinkmong 레코드 id, 값: feeding 시도 횟수
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
    private readonly valkeyService: ValkeyService, // ✅ Valkey 추가
  ) {}

  // 🔹 핑크몽 등장 (전투 시작 시 Valkey에 저장)
  async appearPinkmong(userId: number): Promise<{ message: string }> {
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

    const selectedPinkmong = await this.pinkmongRepository.findOne({
      where: { id: 4 },
    });
    if (!selectedPinkmong) {
      throw new NotFoundException('핑크몽을 찾을 수 없습니다.');
    }

    const existingCatch = await this.catchPinkmongRepository.findOne({
      where: {
        user_id: user.id,
        pinkmong_id: selectedPinkmong.id,
        inventory_id: user.inventory.id,
      },
    });

    if (existingCatch) {
      return { message: `${selectedPinkmong.name}이(가) 이미 등장중입니다!` };
    }

    const catchPinkmong = this.catchPinkmongRepository.create({
      user,
      user_id: user.id,
      pinkmong_id: selectedPinkmong.id,
      inventory: user.inventory,
      inventory_id: user.inventory.id,
    });
    await this.catchPinkmongRepository.save(catchPinkmong);

    this.catchAttempts.set(catchPinkmong.id, 0);

    // ✅ Valkey에 전투 정보 저장 (30분 후 자동 삭제)
    const cacheKey = `pinkmong_battle:${userId}`;
    await this.valkeyService.set(
      cacheKey,
      { userId, pinkmongId: selectedPinkmong.id },
      1800,
    );

    return { message: `${selectedPinkmong.name}이(가) 등장했다!` };
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

    // 🔹 아이템 테이블에서 직접 아이템을 가져옴
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['inventory'],
    });

    if (!item) {
      throw new NotFoundException('아이템을 찾을 수 없습니다.');
    }

    // 🔹 아이템이 현재 유저의 인벤토리에 속해 있는지 확인
    if (!item.inventory || item.inventory.id !== inventory.id) {
      throw new BadRequestException(
        '이 아이템은 현재 유저의 인벤토리에 속해 있지 않습니다.',
      );
    }

    // 🔹 아이템 사용 (개수 감소)
    if (item.count > 0) {
      item.count -= 1;
      await this.itemRepository.save(item);
    } else {
      throw new BadRequestException('해당 아이템의 수량이 부족합니다.');
    }

    // 🔹 포획 확률 계산
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

    // 🔹 포획 성공 (도감 등록)
    await this.catchPinkmongRepository.remove(catchRecord);
    await this.valkeyService.del(`pinkmong_battle:${userId}`);

    const existingCollection = await this.collectionRepository.findOne({
      where: { pinkmong_id: pinkmong.id, user_id: user.id },
    });

    if (!existingCollection) {
      const newCollection = this.collectionRepository.create({
        user,
        user_id: user.id,
        pinkmong,
        pinkmong_id: pinkmong.id,
      });
      await this.collectionRepository.save(newCollection);
    }

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
