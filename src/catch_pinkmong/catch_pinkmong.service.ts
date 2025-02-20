// catch_pinkmong.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CatchPinkmongRepository } from './catch_pinkmong.repository';

@Injectable()
export class CatchPinkmongService {
  // feeding 시도 횟수를 기록하기 위한 in-memory Map
  private catchAttempts: Map<number, number> = new Map();

  constructor(private readonly catchRepo: CatchPinkmongRepository) {}

  // 핑크몽 등장 로직
  async appearPinkmong(userId: number): Promise<{
    message: string;
    pinkmong?: { id: number; name: string; explain: string };
  }> {
    // 1. 유저 조회
    const user = await this.catchRepo.getUser(userId);
    // 2. 인벤토리 조회
    const inventory = await this.catchRepo.getInventoryByUser(user);
    // 3. 이미 인벤토리에 활성화된 CatchPinkmong 레코드가 있는지 확인
    const existingCatch = await this.catchRepo.getExistingCatchByInventory(
      inventory.id,
    );
    if (existingCatch) {
      return { message: `이미 다른 핑크몽이 등장 중입니다!` };
    }
    // 4. 등급 결정 (전설: 5%, 희귀: 35%, 보통: 60%)
    const r = Math.random();
    let selectedGrade: string;
    if (r < 0.05) {
      selectedGrade = 'legendary';
    } else if (r < 0.05 + 0.35) {
      selectedGrade = 'rare';
    } else {
      selectedGrade = 'common';
    }
    // 5. 선택된 등급의 pinkmong에서 region_theme 무작위 선택
    const randomRegion =
      await this.catchRepo.getRandomRegionByGrade(selectedGrade);
    // 6. 선택된 등급과 region_theme에 해당하는 pinkmong 무작위 선택
    const selectedPinkmong =
      await this.catchRepo.getRandomPinkmongByGradeAndRegion(
        selectedGrade,
        randomRegion,
      );
    // 7. 동일 유저, pinkmong, 인벤토리 조합의 기록이 있는지 추가 확인
    const duplicateCatch = await this.catchRepo.getExistingCatch(
      user.id,
      selectedPinkmong.id,
      inventory.id,
    );
    if (duplicateCatch) {
      return { message: `${selectedPinkmong.name}이(가) 이미 등장중입니다!` };
    }
    // 8. 새로운 CatchPinkmong 레코드 생성 및 저장
    const newCatch = await this.catchRepo.createCatchPinkmong(
      user,
      inventory,
      selectedPinkmong,
    );
    // 9. feeding 시도 횟수를 0으로 초기화
    this.catchAttempts.set(newCatch.id, 0);
    // 10. 등장 메시지와 pinkmong 상세 정보 반환
    return {
      message: `${selectedPinkmong.name}이(가) 등장했다!`,
      pinkmong: {
        id: selectedPinkmong.id,
        name: selectedPinkmong.name,
        explain: selectedPinkmong.explain,
      },
    };
  }

  // 먹이 주기 및 포획 로직
  async feeding(
    userId: number,
    itemId: number,
  ): Promise<{ message: string; success: boolean }> {
    // 활성 CatchPinkmong 레코드 조회 (user, pinkmong, inventory 관계 포함)
    const catchRecord = await this.catchRepo.getCatchRecordByUser(userId, [
      'user',
      'pinkmong',
      'inventory',
    ]);
    const { user, pinkmong, inventory } = catchRecord;
    if (!inventory) {
      throw new NotFoundException('해당 유저의 인벤토리를 찾을 수 없습니다.');
    }
    // 아이템 조회 및 인벤토리 소유 확인
    const item = await this.catchRepo.getItemById(itemId);
    if (!item.inventory) {
      throw new BadRequestException(
        '이 아이템은 인벤토리에 속해있지 않습니다.',
      );
    }
    if (item.inventory.id !== inventory.id) {
      throw new BadRequestException(
        '이 아이템은 현재 유저의 인벤토리에 속해 있지 않습니다.',
      );
    }
    if (item.count > 0) {
      item.count = item.count - 1;
      await this.catchRepo.updateItem(item);
    } else {
      throw new BadRequestException('해당 아이템의 수량이 부족합니다.');
    }
    // 기본 포획 확률 및 아이템에 따른 추가 확률 계산
    const baseCatchRate = 0.1;
    const getChanceIncrease = {
      2: 0.15,
      3: 0.27,
      4: 0.35,
    };
    const isBaseItem = item.id === 1;
    const bonus = isBaseItem ? 0 : getChanceIncrease[item.id] || 0;
    const finalCatchRate = baseCatchRate + bonus;
    // 포획 실패 시 처리
    if (Math.random() > finalCatchRate) {
      const currentAttempts = this.catchAttempts.get(catchRecord.id) || 0;
      const newAttempts = currentAttempts + 1;
      this.catchAttempts.set(catchRecord.id, newAttempts);
      if (newAttempts < 5) {
        return {
          message: `핑크몽 포획에 실패했습니다! 아직 ${5 - newAttempts}번의 기회가 남았습니다.`,
          success: false,
        };
      } else {
        await this.catchRepo.removeCatchPinkmong(catchRecord);
        this.catchAttempts.delete(catchRecord.id);
        return {
          message:
            '핑크몽 포획에 실패했습니다! 모든 기회를 소진하여 몬스터가 도망갔습니다.',
          success: false,
        };
      }
    }
    // 포획 성공 시 CatchPinkmong 레코드 삭제
    await this.catchRepo.removeCatchPinkmong(catchRecord);
    // 컬렉션(도감) 중복 체크 및 등록
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

  // 도망(포기) 로직: CatchPinkmong 레코드 삭제 및 feeding 시도 기록 제거
  async giveup(userId: number): Promise<{ message: string; success: boolean }> {
    const catchRecord = await this.catchRepo.getCatchRecordByUser(userId, [
      'pinkmong',
    ]);
    await this.catchRepo.removeCatchPinkmong(catchRecord);
    this.catchAttempts.delete(catchRecord.id);
    return { message: `성공적으로 도망쳤습니다!`, success: false };
  }
}
