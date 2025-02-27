// catch_pinkmong.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CatchPinkmongRepository } from './catch_pinkmong.repository';
import { ValkeyService } from 'src/valkey/valkey.service';

@Injectable()
export class CatchPinkmongService {
  // feeding 시도 횟수를 기록하기 위한 in-memory Map
  private catchAttempts: Map<number, number> = new Map();

  constructor(
    private readonly catchRepo: CatchPinkmongRepository,
    private readonly valkeyService: ValkeyService, // ✅ Valkey 추가
  ) {}

  // 🔹 핑크몽 등장 (전투 시작 시 Valkey에 저장)
  async appearPinkmong(
    userId: number,
  ): Promise<{ pinkmongImage?: string; message: string }> {
    // 1. 유저 조회
    const user = await this.catchRepo.getUser(userId);
    // 2. 인벤토리 조회
    const inventory = await this.catchRepo.getInventoryByUser(user);
    // 3. 현재 인벤토리에 활성화된 핑크몽이 있는지 확인
    const existingCatch = await this.catchRepo.getExistingCatchByInventory(
      inventory.id,
    );
    if (existingCatch) {
      return { message: `이미 다른 핑크몽이 등장 중입니다!` };
    }

    // ✅ 4. 등급 결정 (전설: 5%, 희귀: 35%, 보통: 60%)
    const r = Math.random();
    let selectedGrade: string;
    if (r < 0.05) {
      selectedGrade = 'legendary';
    } else if (r < 0.05 + 0.35) {
      selectedGrade = 'rare';
    } else {
      selectedGrade = 'common';
    }

    // ✅ 5. 선택된 등급과 지역에 따른 핑크몽 선택
    const randomRegion =
      await this.catchRepo.getRandomRegionByGrade(selectedGrade);
    const selectedPinkmong =
      await this.catchRepo.getRandomPinkmongByGradeAndRegion(
        selectedGrade,
        randomRegion,
      );

    // 6. 동일한 핑크몽이 있는지 중복 체크
    const duplicateCatch = await this.catchRepo.getExistingCatch(
      user.id,
      selectedPinkmong.id,
      inventory.id,
    );
    if (duplicateCatch) {
      return { message: `${selectedPinkmong.name}이(가) 이미 등장중입니다!` };
    }

    // ✅ 7. CatchPinkmong 생성 및 저장
    const newCatch = await this.catchRepo.createCatchPinkmong(
      user,
      inventory,
      selectedPinkmong,
    );

    // ✅ 8. feeding 시도 횟수를 0으로 초기화
    this.catchAttempts.set(newCatch.id, 0);

    // ✅ 9. Valkey에 전투 정보 저장 (30분 후 자동 삭제)
    const cacheKey = `pinkmong_battle:${userId}`;
    await this.valkeyService.set(
      cacheKey,
      { userId, pinkmongId: selectedPinkmong.id },
      1800, // 30분 TTL
    );

    return {
      pinkmongImage: selectedPinkmong.pinkmong_image,
      message: `${selectedPinkmong.name}이(가) 등장했다! (등급: ${selectedGrade})`,
    };
  }

  // 🔹 먹이를 주고 잡는 로직
  async feeding(
    userId: number,
    itemId: number,
  ): Promise<{ message: string; success: boolean }> {
    // 1. 활성 CatchPinkmong 레코드 조회
    const catchRecord = await this.catchRepo.getCatchRecordByUser(userId, [
      'user',
      'pinkmong',
      'inventory',
    ]);
    const { user, pinkmong, inventory } = catchRecord;
    if (!inventory) {
      throw new NotFoundException('해당 유저의 인벤토리를 찾을 수 없습니다.');
    }

    // 2. 아이템 조회 및 인벤토리 소유 확인
    const item = await this.catchRepo.getItemById(itemId);
    if (!item.inventory || item.inventory.id !== inventory.id) {
      throw new BadRequestException(
        '이 아이템은 현재 유저의 인벤토리에 속해 있지 않습니다.',
      );
    }

    // 3. 아이템 사용 (개수 감소)
    if (item.count > 0) {
      item.count -= 1;
      await this.catchRepo.updateItem(item);

      // Valkey에 인벤토리 아이템 목록 업데이트
      const invenItemsKey = `invenItems:${userId}`;
      const existingItems: any = await this.valkeyService.get(
        `invenItems:${userId}`,
      );

      const updatedItems = existingItems.map((existingItem) =>
        existingItem.id === item.id
          ? {
              ...existingItem,
              count: item.count,
            }
          : existingItem,
      );
      await this.valkeyService.set(invenItemsKey, updatedItems, 3600); // 1시간 TTL
    } else {
      throw new BadRequestException('해당 아이템의 수량이 부족합니다.');
    }

    // 4. 포획 확률 계산
    const baseCatchRate = 0.1;
    const getChanceIncrease = { 2: 0.15, 3: 0.27, 4: 0.35 };
    const bonus = getChanceIncrease[item.id] || 0;
    const finalCatchRate = baseCatchRate + bonus;

    // 5. 포획 실패 시 처리
    if (Math.random() > finalCatchRate) {
      const attempts = (this.catchAttempts.get(catchRecord.id) || 0) + 1;
      this.catchAttempts.set(catchRecord.id, attempts);

      if (attempts < 5) {
        return {
          message: `핑크몽 포획 실패! 남은 기회: ${5 - attempts}`,
          success: false,
        };
      } else {
        await this.catchRepo.removeCatchPinkmong(catchRecord);
        this.catchAttempts.delete(catchRecord.id);
        await this.valkeyService.del(`pinkmong_battle:${userId}`); // ✅ Valkey에서 삭제
        return { message: '핑크몽이 도망갔습니다!', success: false };
      }
    }

    // ✅ 6. 포획 성공 (도감 등록)
    await this.catchRepo.removeCatchPinkmong(catchRecord);
    await this.valkeyService.del(`pinkmong_battle:${userId}`); // ✅ Valkey에서 삭제

    const existingCollection = await this.catchRepo.getCollection(
      user.id,
      pinkmong.id,
    );

    if (existingCollection) {
      return {
        message: `${pinkmong.name}을(를) 잡았습니다!`,
        success: true,
      };
    } else {
      await this.catchRepo.createCollection(user, pinkmong);
      return {
        message: `${pinkmong.name}을(를) 잡았습니다! 최초 포획으로 도감에 등록되었습니다!`,
        success: true,
      };
    }
  }

  // 🔹 유저가 도망 (전투 종료 시 Valkey에서 삭제)
  async giveup(userId: number): Promise<{ message: string; success: boolean }> {
    // 1. 활성 CatchPinkmong 레코드 조회
    const catchRecord = await this.catchRepo.getCatchRecordByUser(userId, [
      'pinkmong',
    ]);

    // 2. 전투 종료 및 데이터 삭제
    await this.catchRepo.removeCatchPinkmong(catchRecord);
    this.catchAttempts.delete(catchRecord.id);
    await this.valkeyService.del(`pinkmong_battle:${userId}`); // ✅ Valkey에서 삭제

    return { message: `성공적으로 도망쳤습니다!`, success: false };
  }
}
