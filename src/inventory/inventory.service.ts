import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository } from '../item/item.repository';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryRepository } from './inventory.repository';
import { UserRepository } from '../user/user.repository';
import { ValkeyService } from '../valkey/valkey.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly userRepository: UserRepository,
    private readonly valkeyService: ValkeyService,
  ) {}

  createInventory(createInventoryDto: CreateInventoryDto) {
    return this.inventoryRepository.createInventory(createInventoryDto);
  }

  async findItemsByUserId(userId: number) {
    const inventory = await this.inventoryRepository.findOneByUserId(userId);
    if (!inventory) {
      throw new NotFoundException('유저의 인벤토리를 찾을 수 없습니다.');
    }
    const items = await this.itemRepository.findItemsByInventoryId(
      inventory.id,
    );
    const invenItems = items.map((item) => ({
      id: item.id,
      count: item.count,
      storeItemName: item.store_item.name,
      storeItemImage: item.store_item.item_image,
      potion: item.store_item.potion,
      potionTime: item.store_item.potion_time,
    }));
    const cachedinvenItems: any = await this.valkeyService.get(
      `invenItems:${userId}`,
    );
    if (cachedinvenItems) {
      return cachedinvenItems; // 캐시된 데이터 반환
    }
    await this.valkeyService.set(`invenItems:${userId}`, invenItems, 600);

    return invenItems;
  }
}
