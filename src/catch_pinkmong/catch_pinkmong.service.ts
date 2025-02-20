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
  ) {}

  // 새로운 CatchPinkmong 생성
  async appearPinkmong(userId: number): Promise<{
    message: string;
    pinkmong?: { id: number; name: string; explain: string };
  }> {
    // 1. 유저 조회
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    // 유저가 없으면 NotFoundException 발생
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    // 2. inventoryRepository를 이용하여 유저의 인벤토리 조회
    const inventory = await this.inventoryRepository.findOne({
      where: { user_id: user.id },
    });
    // 인벤토리가 없으면 NotFoundException 발생
    if (!inventory) {
      throw new NotFoundException('해당 유저의 인벤토리를 찾을 수 없습니다.');
    }

    // 3. 인벤토리에 이미 CatchPinkmong 레코드가 존재하는지 확인 (한 인벤토리에는 하나만 존재)
    const existingInventoryCatch = await this.catchPinkmongRepository.findOne({
      where: { inventory_id: inventory.id },
    });
    // 이미 존재하면 등장 중이라는 메시지를 반환
    if (existingInventoryCatch) {
      return { message: `이미 다른 핑크몽이 등장 중입니다!` };
    }

    // 4. 등급을 고정 확률로 랜덤 선택
    // Math.random()을 통해 0 ~ 1 사이의 난수를 생성
    // 전설: 5%, 희귀: 40%, 보통: 55%
    const r = Math.random();
    let selectedGrade: string;
    if (r < 0.05) {
      selectedGrade = 'legendary'; // 난수가 0 ~ 0.05이면 'legendary'
    } else if (r < 0.05 + 0.35) {
      selectedGrade = 'rare'; // 난수가 0.05 이상 0.40 미만이면 'rare'
    } else {
      selectedGrade = 'common'; // 그 외에는 'common'
    }

    // 5. 선택된 등급에 해당하는 pinkmong들 중에서 region_theme을 그룹화하여 RAND() 함수로 무작위 선택
    const randomRegionResult = await this.pinkmongRepository
      .createQueryBuilder('p')
      .select('p.region_theme', 'region')
      .where('p.grade = :grade', { grade: selectedGrade })
      .groupBy('p.region_theme')
      .orderBy('RAND()')
      .getRawOne();
    // region_theme이 없으면 예외 발생
    if (!randomRegionResult)
      throw new NotFoundException(
        '해당 등급에 등록된 region_theme이 없습니다.',
      );
    // 선택된 region_theme 값을 저장
    const randomRegion = randomRegionResult.region;

    // 6. 선택된 등급과 region_theme 조건에 맞는 pinkmong 중 무작위로 하나의 레코드를 조회
    const selectedPinkmong = await this.pinkmongRepository
      .createQueryBuilder('p')
      .where('p.grade = :grade', { grade: selectedGrade })
      .andWhere('p.region_theme = :region', { region: randomRegion })
      .orderBy('RAND()')
      .getOne();
    // pinkmong이 없으면 예외 발생
    if (!selectedPinkmong)
      throw new NotFoundException(
        '해당 등급 및 region_theme에 해당하는 pinkmong이 없습니다.',
      );

    // 7. 기존 CatchPinkmong 중 동일한 user, pinkmong, inventory 조합의 기록이 있는지 추가 검증
    const existingCatch = await this.catchPinkmongRepository.findOne({
      where: {
        user_id: user.id,
        pinkmong_id: selectedPinkmong.id,
        inventory_id: inventory.id,
      },
    });
    // 이미 존재하면 등장 중이라는 메시지 반환
    if (existingCatch) {
      return { message: `${selectedPinkmong.name}이(가) 이미 등장중입니다!` };
    }

    // 8. 새로운 CatchPinkmong 레코드 생성 및 저장 (유저, pinkmong, 인벤토리 정보를 기록)
    const catchPinkmong = this.catchPinkmongRepository.create({
      user,
      user_id: user.id,
      pinkmong_id: selectedPinkmong.id,
      inventory, // 별도로 조회한 inventory 사용
      inventory_id: inventory.id,
    });
    await this.catchPinkmongRepository.save(catchPinkmong);

    // 9. feeding(먹이 주기) 시도 횟수를 0으로 초기화 (in-memory Map에 등록)
    this.catchAttempts.set(catchPinkmong.id, 0);

    // 10. pinkmong 등장 메시지와 선택된 pinkmong의 상세 정보를 반환
    return {
      message: `${selectedPinkmong.name}이(가) 등장했다!`,
      pinkmong: {
        id: selectedPinkmong.id,
        name: selectedPinkmong.name,
        explain: selectedPinkmong.explain,
      },
    };
  }

  // 먹이를 주고 핑크몽을 잡는 로직을 처리하는 메서드입니다.
  async feeding(
    userId: number, // 먹이 주기를 시도하는 사용자의 id
    itemId: number, // 사용하려는 아이템의 id
  ): Promise<{ message: string; success: boolean }> {
    // 사용자 ID를 기준으로 활성화된 CatchPinkmong 레코드를 조회합니다.
    // relations 옵션을 사용해 user, pinkmong, inventory 정보를 함께 로드합니다.
    const catchRecord = await this.catchPinkmongRepository.findOne({
      where: { user_id: userId },
      relations: ['user', 'pinkmong', 'inventory'],
    });
    // 만약 활성 레코드가 없다면, 핑크몽을 잡을 수 없으므로 예외 발생
    if (!catchRecord) {
      throw new NotFoundException('해당 핑크몽을 잡을 수 없습니다.');
    }
    // 구조 분해 할당을 통해 catchRecord의 user, pinkmong, inventory 값을 가져옵니다.
    const { user, pinkmong, inventory } = catchRecord;
    // 인벤토리 정보가 없다면 예외 발생
    if (!inventory) {
      throw new NotFoundException('해당 유저의 인벤토리를 찾을 수 없습니다.');
    }

    // 아이템 Repository를 사용하여 itemId에 해당하는 아이템을 조회합니다.
    // 아이템과 연결된 inventory 정보도 relations 옵션으로 함께 로드합니다.
    const item = await this.itemRepository.findOne({
      where: { id: itemId },
      relations: ['inventory'],
    });
    // 아이템이 존재하지 않으면 예외 발생
    if (!item) {
      throw new NotFoundException('아이템을 찾을 수 없습니다.');
    }

    // 조회된 아이템이 인벤토리에 속해 있는지 확인합니다.
    if (!item.inventory) {
      throw new BadRequestException(
        '이 아이템은 인벤토리에 속해있지 않습니다.',
      );
    }

    // 조회된 아이템의 인벤토리가 현재 사용자의 인벤토리와 일치하는지 확인합니다.
    if (item.inventory.id !== inventory.id) {
      throw new BadRequestException(
        '이 아이템은 현재 유저의 인벤토리에 속해 있지 않습니다.',
      );
    }

    // 아이템의 count(보유 수량)가 0보다 크면 1 감소시키고 저장합니다.
    if (item.count > 0) {
      item.count = item.count - 1; // 아이템 수량 1 감소
      await this.itemRepository.save(item); // 변경된 아이템 정보를 저장
    } else {
      // 아이템 수량이 부족하면 예외 발생
      throw new BadRequestException('해당 아이템의 수량이 부족합니다.');
    }

    // 기본 포획 확률을 0.1(10%)로 설정합니다.
    const baseCatchRate = 0.1;
    // 아이템 id에 따른 추가 확률(bonus)을 정의하는 객체입니다.
    // 예시로 아이템 id 2, 3, 4에 대해 각각 다른 추가 확률을 부여합니다.
    const getChanceIncrease = {
      2: 0.15, // 아이템 id 2: 15% 추가 확률
      3: 0.27, // 아이템 id 3: 27% 추가 확률
      4: 0.35, // 아이템 id 4: 35% 추가 확률
    };
    // 기본 아이템(예: item.id === 1)인 경우 추가 확률은 0입니다.
    const isBaseItem = item.id === 1;
    // 추가 확률(bonus)은 기본 아이템이면 0, 아니면 getChanceIncrease에서 아이템 id에 해당하는 값을 사용합니다.
    const bonus = isBaseItem ? 0 : getChanceIncrease[item.id] || 0;
    // 최종 포획 확률은 기본 확률과 추가 확률을 합산합니다.
    const finalCatchRate = baseCatchRate + bonus;

    // Math.random()을 사용하여 포획에 성공할 확률을 결정합니다.
    // 만약 랜덤 값이 finalCatchRate보다 크면 실패한 것으로 처리합니다.
    if (Math.random() > finalCatchRate) {
      // 현재 feeding 시도 횟수를 in-memory Map에서 가져옵니다. (없으면 0으로 간주)
      const currentAttempts = this.catchAttempts.get(catchRecord.id) || 0;
      // feeding 시도 횟수를 1 증가시킵니다.
      const newAttempts = currentAttempts + 1;
      // 증가된 시도 횟수를 Map에 업데이트합니다.
      this.catchAttempts.set(catchRecord.id, newAttempts);
      // 시도 횟수가 5회 미만이면 남은 기회를 알려주며 실패 메시지 반환
      if (newAttempts < 5) {
        return {
          message: `핑크몽 포획에 실패했습니다! 아직 ${5 - newAttempts}번의 기회가 남았습니다.`,
          success: false,
        };
      } else {
        // 5회 이상 실패하면 CatchPinkmong 레코드를 삭제하고 feeding 시도 기록도 삭제한 후 실패 메시지 반환
        await this.catchPinkmongRepository.remove(catchRecord);
        this.catchAttempts.delete(catchRecord.id);
        return {
          message:
            '핑크몽 포획에 실패했습니다! 모든 기회를 소진하여 몬스터가 도망갔습니다.',
          success: false,
        };
      }
    }

    // 포획에 성공하면, 더 이상 필요하지 않은 CatchPinkmong 레코드를 삭제합니다.
    await this.catchPinkmongRepository.remove(catchRecord);

    //  컬렉션(도감)에 이미 해당 유저와 핑크몽 조합의 레코드가 있는지 확인합니다.
    const existingCollection = await this.collectionRepository.findOne({
      where: { pinkmong_id: pinkmong.id, user_id: user.id },
    });

    // 이미 도감에 등록되어 있으면 단순히 성공 메시지를 반환합니다.
    if (existingCollection) {
      return {
        message: `${pinkmong.name}을(를) 잡았습니다!`,
        success: true,
      };
    } else {
      // 최초 포획이면 새로운 Collection 레코드를 생성하여 도감에 등록합니다.
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

  // 도망 로직: 유저의 CatchPinkmong 레코드를 삭제하여 몬스터 등장 기록을 제거합니다.
  async giveup(userId: number): Promise<{ message: string; success: boolean }> {
    // userId를 기준으로 CatchPinkmong 레코드를 조회합니다.
    // 여기서는 pinkmong 정보만 relations로 로드합니다.
    const catchRecord = await this.catchPinkmongRepository.findOne({
      where: { user_id: userId },
      relations: ['pinkmong'],
    });
    // 만약 해당 레코드가 없으면 예외 발생
    if (!catchRecord) {
      throw new NotFoundException(
        '해당 유저의 몬스터 등장 기록을 찾을 수 없습니다.',
      );
    }

    // CatchPinkmong 레코드를 삭제하여 도망 처리를 진행합니다.
    await this.catchPinkmongRepository.remove(catchRecord);
    // in-memory Map에서 feeding 시도 기록도 함께 삭제합니다.
    this.catchAttempts.delete(catchRecord.id);
    // 도망 성공 메시지와 함께 success:false를 반환합니다.
    return { message: `성공적으로 도망쳤습니다!`, success: false };
  }
}
