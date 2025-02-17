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

@Injectable()
export class CatchPinkmongService {
  // [추가] feeding 시도 횟수를 기록하기 위한 in-memory Map
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
  ) {}

  // 새로운 CatchPinkmong 생성
  // 몬스터 등장 로직
  async appearPinkmong(userId: number): Promise<{
    message: string;
    pinkmong?: { id: number; name: string; explain: string };
  }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['inventory'], // 유저의 인벤토리를 가져옴
    });

    // 유저가 존재하지 않을때
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }
    // 유저의 인벤토리가 없을때
    if (!user.inventory) {
      throw new NotFoundException('해당 유저의 인벤토리를 찾을 수 없습니다.');
    }

    // DB에서 pinkmong_id가 4인 핑크몽을 가져옴
    const selectedPinkmong = await this.pinkmongRepository.findOne({
      where: { id: 4 },
    });

    if (!selectedPinkmong) {
      throw new NotFoundException('핑크몽을 찾을 수 없습니다.');
    }

    // 동일한 user, pinkmong, inventory 조합의 CatchPinkmong 레코드가 이미 있는지 확인
    const existingCatch = await this.catchPinkmongRepository.findOne({
      where: {
        user_id: user.id,
        pinkmong_id: selectedPinkmong.id,
        inventory_id: user.inventory.id,
      },
    });

    if (existingCatch) {
      // 이미 해당 조합으로 생성되어 있다면, 중복 생성하지 않고 메시지 반환
      return { message: `${selectedPinkmong.name}이(가) 이미 등장중입니다!` };
    }

    // CatchPinkmong 레코드 생성
    const catchPinkmong = this.catchPinkmongRepository.create({
      user,
      user_id: user.id,
      pinkmong_id: selectedPinkmong.id,
      inventory: user.inventory,
      inventory_id: user.inventory.id,
    });
    await this.catchPinkmongRepository.save(catchPinkmong);

    // 잡기 시도 기록을 0으로 초기화
    this.catchAttempts.set(catchPinkmong.id, 0);

    return { message: `${selectedPinkmong.name}이(가) 등장했다!` };
  }

  // 먹이를 주고 잡는 로직
  async feeding(
    catchId: number, // catchPinkmong 레코드의 id
    itemId: number, // 사용하려는 아이템 ID
  ): Promise<{ message: string; success: boolean }> {
    // catchPinkmong 레코드 조회 (user, pinkmong, inventory 관계 포함)
    const catchRecord = await this.catchPinkmongRepository.findOne({
      where: { id: catchId },
      relations: ['user', 'pinkmong', 'inventory'],
    });
    if (!catchRecord) {
      throw new NotFoundException('해당 몬스터는 이미 잡혔거나 도망쳤습니다.');
    }
    const { user, pinkmong, inventory } = catchRecord;
    if (!inventory) {
      throw new NotFoundException('해당 유저의 인벤토리를 찾을 수 없습니다.');
    }

    // 아이템 테이블에서 직접 아이템을 가져옴 + 인벤토리 관계 로드
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['inventory'],
    });
    if (!item) {
      throw new NotFoundException('아이템을 찾을 수 없습니다.');
    }

    // 아이템이 인벤토리에 소속되어 있는지 확인
    if (!item.inventory) {
      throw new BadRequestException(
        '이 아이템은 인벤토리에 속해있지 않습니다.',
      );
    }

    // 아이템이 현재 유저의 인벤토리에 속해 있는지 확인
    if (item.inventory.id !== inventory.id) {
      throw new BadRequestException(
        '이 아이템은 현재 유저의 인벤토리에 속해 있지 않습니다.',
      );
    }

    // 아이템 사용하면 아이템보유수 1감소
    if (item.count > 0) {
      item.count = item.count - 1; // count 1 감소
      await this.itemRepository.save(item); // 변경사항 저장
    } else {
      throw new BadRequestException('해당 아이템의 수량이 부족합니다.');
    }

    // 확률 계산 (기본 확률에 아이템에 따른 추가 확률을 더함)
    // 기본 아이템 (예: item.id === 1)인 경우 추가 확률은 0
    const baseCatchRate = 0.1;
    const getChanceIncrease = {
      // 예시: 아이템 id 2, 3에 대해서만 추가 확률을 부여

      // 나중에 등급이 나오면 퍼센트 감소 ====================

      // 1번은 스웨디시젤리 10%
      2: 0.15, // 핑크과자 25%
      3: 0.27, // 37%
      4: 0.35, // 45%
    };
    //스웨디시젤리
    const isBaseItem = item.id === 1; // 기본 베이스 아이템의 id를 1로 가정

    const bonus = isBaseItem ? 0 : getChanceIncrease[item.id] || 0;
    const finalCatchRate = baseCatchRate + bonus;

    // 잡기 실패: 확률 계산 결과 실패하면, feeding 시도 횟수를 업데이트
    // finalCatchRate보다 큰 경우, 몬스터 잡기에 실패한 것으로 판단합니다.
    // 만약 해당 레코드의 feeding 시도 횟수가 아직 기록되어 있지 않다면, 기본값으로 0을 사용합니다.
    if (Math.random() > finalCatchRate) {
      // 현재 시도 횟수를 업데이트
      // 해당 catchId에 대해 기록된 feeding 시도 횟수를 가져오고, 만약 기록이 없다면 0을 사용
      const currentAttempts = this.catchAttempts.get(catchId) || 0;
      // 현재 시도 횟수에 1을 더하여 새 feeding 시도 횟수를 계산합니다.
      const newAttempts = currentAttempts + 1;
      this.catchAttempts.set(catchId, newAttempts);
      // feeding 시도 횟수가 아직 5번 미만인 경우
      if (newAttempts < 5) {
        // 남은 기회 수: 5번에서 현재 시도 횟수를 뺀 값
        return {
          message: `핑크몽을 잡는 데 실패했습니다! 아직 ${5 - newAttempts}번의 기회가 남았습니다.`,
          success: false,
        };
      } else {
        // 5번 실패 시, catchRecord 삭제 및 시도 기록 초기화 (몬스터 도망)
        await this.catchPinkmongRepository.remove(catchRecord);
        // 그리고 해당 catchId에 대한 feeding 시도 기록을 삭제하여 초기화합니다.
        this.catchAttempts.delete(catchId);
        return {
          message:
            '핑크몽을 잡는 데 실패했습니다! 모든 기회를 소진하여 몬스터가 도망갔습니다.',
          success: false,
        };
      }
    }

    // 잡기 성공 시, catchRecord 삭제 (몬스터를 잡았으므로 등장 기록 삭제)
    await this.catchPinkmongRepository.remove(catchRecord);

    // 컬렉션(도감)에 해당 유저와 핑크몽 조합의 레코드가 있는지 확인
    const existingCollection = await this.collectionRepository.findOne({
      where: { pinkmong_id: pinkmong.id, user_id: user.id },
    });

    if (existingCollection) {
      // 이미 등록된 경우
      return {
        message: `${pinkmong.name}을(를) 잡았습니다!`,
        success: true,
      };
    } else {
      // 최초 포획인 경우 도감에 추가
      const newCollection = this.collectionRepository.create({
        user,
        user_id: user.id,
        pinkmong,
        pinkmong_id: pinkmong.id,
      });
      await this.collectionRepository.save(newCollection);
      return {
        message: `${pinkmong.name}을(를) 잡았습니다! 최초 포획으로 도감에 등록되었습니다!`,
        success: true,
      };
    }
  }

  // 도망 로직: catchPinkmong 레코드만 삭제
  async giveup(
    catchId: number,
  ): Promise<{ message: string; success: boolean }> {
    const catchRecord = await this.catchPinkmongRepository.findOne({
      where: { id: catchId },
      relations: ['pinkmong'],
    });
    if (!catchRecord) {
      throw new NotFoundException('해당 몬스터 등장 기록을 찾을 수 없습니다.');
    }

    const { pinkmong } = catchRecord;
    await this.catchPinkmongRepository.remove(catchRecord);
    return { message: `${pinkmong.name}이 도망갔습니다!`, success: false };
  }
}
