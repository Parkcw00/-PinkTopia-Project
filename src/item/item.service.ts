import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemRepository } from './item.repository';
import { StoreItemRepository } from '../store-item/store-item.repository';
import { Item } from './entities/item.entity';
import { InventoryRepository } from '../inventory/inventory.repository';
// import { UserInfo } from 'src/auth/user-info.decorator';

@Injectable()
export class ItemService {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly storeItemRepository: StoreItemRepository,
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async purchaseItem(/*userInfo: UserInfo,*/ createItemDto: CreateItemDto): Promise<Item> {
    const { storeItemId, inventoryId, count } = createItemDto;

    // StoreItem 테이블에서 아이템 확인
    const storeItem = await this.storeItemRepository.storeItemFindOne(storeItemId);
    if (!storeItem) {
        throw new NotFoundException('상점에 존재하지 않는 아이템입니다.');
    }

    // Inventory 테이블에서 인벤토리 확인
    const inventory = await this.inventoryRepository.findOneByInventoryId(inventoryId);
    if (!inventory) {
        throw new NotFoundException('존재하지 않는 인벤토리입니다.');
    }

    console.log(`storeItem: ${JSON.stringify(storeItem, null, 2)}`);
    // 아이템 수량 확인
    if (storeItem.potion) {
      if (count > 99) {
        throw new Error('아이템 수량은 최대 99개까지만 구매할 수 있습니다.');
      }
    }
    console.log(`count: ${count}`);

    // Item 테이블에 저장
    return this.itemRepository.buyItem(createItemDto);
  }

  async findAll() {
    return await this.itemRepository.findAll();
  }

  async findOne(id: number) {
    return await this.itemRepository.findOne(id);
  }

  async sellItem(id: number) {
    const item = await this.itemRepository.findOneByItemId(id);
    if (!item) {
      throw new NotFoundException('아이템을 찾을 수 없습니다.');
    }

    const storeItem = await this.storeItemRepository.storeItemFindOne(id);
    if (!storeItem) {
      throw new NotFoundException('상점에 존재하지 않는 아이템입니다.');
    }

    // 수량 감소 로직
    if (item.count <= 0) {
      throw new Error('현재 보유한 아이템 수량이 부족합니다.');
    }

    item.count -= 1;
    const refundAmount = storeItem.gem_price * 0.5;

    if (item.count === 0) {
      await this.itemRepository.deleteItem(id);// 고민고민 해보기기
    } else {
      await this.itemRepository.updateItem(id, { count: item.count }); 
    }

    return { refundAmount };
  }

}
