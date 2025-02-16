import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemRepository } from './item.repository';
import { StoreItemRepository } from '../store-item/store-item.repository';
import { Item } from './entities/item.entity';
import { InventoryRepository } from '../inventory/inventory.repository';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemService {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly storeItemRepository: StoreItemRepository,
    private readonly inventoryRepository: InventoryRepository,
  ) {}

  async purchaseItem(userId: number, createItemDto: CreateItemDto): Promise<Item> {
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

    // 기존 아이템 확인
    const item = await this.itemRepository.findOneByInventoryIdAndStoreItemId(inventoryId, storeItemId);
    if (item) {
        // 수량 증가 시 최대 수량 확인
        if (item.count + count >= 100) {
            throw new NotFoundException('아이템 수량은 최대 99개까지만 구매할 수 있습니다.');
        }
        item.count += count;
        await this.itemRepository.updateItem(item.id, { count: item.count });
        return item;
    } else {
        // 새로운 아이템 생성 시 최대 수량 확인
        if (count >= 100) {
            throw new NotFoundException('아이템 수량은 최대 99개까지만 구매할 수 있습니다.');
        }
        return await this.itemRepository.buyItem(createItemDto);
    }
  }

  async findAll() {
    return await this.itemRepository.findAll();
  }

  async findOne(id: number) {
    return await this.itemRepository.findOne(id);
  }

  async sellItem(userId: number, id: number, updateItemDto: UpdateItemDto) {
    const sellCount = updateItemDto.count;

    const item = await this.itemRepository.findOneByItemId(id);
    if (!item) {
      throw new NotFoundException('아이템을 찾을 수 없습니다.');
    }

    const storeItemId = item.store_item_id;


    const storeItem = await this.storeItemRepository.storeItemFindOne(storeItemId);
    if (!storeItem) {
      throw new NotFoundException('상점에 존재하지 않는 아이템입니다.');
    }

    // 수량 감소 로직
    if (item.count < sellCount) {
        throw new NotFoundException('현재 보유한 아이템 수량이 판매 수량 보다 부족합니다.');
    }

    item.count -= sellCount;
    const refundAmount = storeItem.gem_price * sellCount * 0.5;

    if (item.count === 0) {
      await this.itemRepository.deleteItem(id);
    } else {
      await this.itemRepository.updateItem(id, { count: item.count }); 
    }

    return { message: `${storeItem.name} ${sellCount}개를 판매하였습니다.`, refundAmount };
  }

}
