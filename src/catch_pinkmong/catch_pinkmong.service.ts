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

// 하드코딩된 임의의 핑크몽 배열
const pinkMongsOption = [
  {
    id: 1,
    name: '핑크솔트',
    explain:
      '염소같이 생긴 전설의 핑크몽으로 분홍색 오오라가 온몸을 덮고 있다. 바람에 휘날리는 갈기는 마치 구름을 연상케 한다. 핑크솔트의 털에서 짠맛이 난다고 전해진다.',
  },
  {
    id: 2,
    name: '핑토',
    explain:
      '이름 그대로 핑크색 토끼의 외형을 지닌 핑크몽으로, 의외로 젤리 같은 촉감이 난다.',
  },
  {
    id: 3,
    name: '눈여호',
    explain:
      '하얀 눈 같은 모습과 여우 같은 외형을 가지고 있으며, 호랑이와 같은 용맹함을 지녔다고 한다.',
  },
];

@Injectable()
export class CatchPinkmongService {
  private pinkmongs = pinkMongsOption;

  constructor(
    @InjectRepository(CatchPinkmong)
    private catchPinkmongRepository: Repository<CatchPinkmong>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Pinkmong)
    private pinkmongRepository: Repository<Pinkmong>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
  ) {}

  // 새로운 CatchPinkmong 생성
  // 몬스터 등장 로직
  async appearPinkmong(userId: number): Promise<{
    message: string;
    monster?: { id: number; name: string; explain: string };
  }> {
    // 유저 존재 여부 확인
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }

    // const appearanceChance = Math.random(); // 0 ~ 1 사이의 랜덤 값 생성
    // if (appearanceChance > 0.1) {
    //   return { message: '몬스터가 나타나지 않았습니다.' };
    // }

    // 2. 무조건 첫 번째 몬스터를 사용 (GPS 연동 전 임시)
    const selectedPinkmong = this.pinkmongs[0]; // 임시로 원하는 핑크몽 배열 사용

    // 3. 유저-몬스터 상호작용(CatchPinkmong) 테이블에 레코드 생성
    const catchPinkmong = this.catchPinkmongRepository.create({
      user,
      user_id: user.id,
      // 실제 Pinkmong 테이블과 연동하려면 pinkmong_id가 DB에 있어야 합니다
      // 여기서는 하드코딩된 pinkmong_id를 그대로 사용
      pinkmong_id: selectedPinkmong.id,
    });
    await this.catchPinkmongRepository.save(catchPinkmong);

    // 4. 굳이 몬스터 정보를 반환하지 않고, 단순 메시지만 반환
    return { message: '몬스터가 등장했다!' };
  }

  // 몬스터를 잡는 로직
  async feeding(
    userId: number,
    pinkmongId: number,
    inventoryId: number,
    itemId: number, // 사용자가 선택한 아이템 ID
  ): Promise<{ message: string; success: boolean }> {
    // 유저 존재 여부 확인
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');

    // 핑크몽 존재 여부 확인
    const pinkmong = await this.pinkmongRepository.findOne({
      where: { id: pinkmongId },
      relations: ['item'],
    });
    if (!pinkmong)
      throw new NotFoundException('해당 핑크몽을 찾을 수 없습니다.');

    // 유저의 인벤토리에서 사용한 아이템 확인
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId, user: { id: userId } },
      relations: ['item'], // 아이템 정보 가져오기
    });

    // 아이템이 존재하지 않거나 수량이 0 개일때
    if (!inventory || !inventory.item)
      throw new BadRequestException('해당 아이템이 없습니다.');

    // 사용자가 선택한 아이템 찾기
    const selectedItem = inventory.item.find((item) => item.id === itemId);

    if (!selectedItem)
      throw new BadRequestException('선택한 아이템을 찾을 수 없습니다.');

    // 아이템 효과에 따른 핑크몽 잡힐 확률 증가
    const itemEffect = {
      1: 0.1, // 10% 확률 증가
      2: 0.17, // 17% 확률 증가
      3: 0.25, // 25% 확률 증가
    };

    const baseCatchRate = 0.1; // 기본 10% 확률
    const itemBonus = itemEffect[selectedItem.id] || 0; // 사용자가 선택한 아이템의 효과 적용
    const finalCatchRate = baseCatchRate + itemBonus;

    // 확률 계산 후 잡기 성공 여부 결정
    if (Math.random() > finalCatchRate) {
      // 아이템 사용 후 제거 (실패해도 아이템 사라짐)
      await this.inventoryRepository.remove(inventory);

      return { message: `핑크몽을 잡는 데 실패했습니다!`, success: false };
    }

    // 핑크몽 잡기 성공 → 도감(컬렉션)에 추가
    const newCollection = this.collectionRepository.create({
      user,
      user_id: user.id,
      pinkmong,
      pinkmong_id: pinkmong.id,
    });
    await this.collectionRepository.save(newCollection);

    await this.inventoryRepository.remove(inventory);

    return { message: `${pinkmong.name}을(를) 잡았습니다!`, success: true };
  }

  remove(id: number) {
    return `This action removes a #${id} catchPinkmong`;
  }
}
