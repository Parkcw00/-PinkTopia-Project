import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository } from 'src/item/item.repository';
import { CreateItemDto } from 'src/item/dto/create-item.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryRepository } from './inventory.repository';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class InventoryService {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly userRepository: UserRepository,
  ) {}

  createInventory(createInventoryDto: CreateInventoryDto) {
    return this.inventoryRepository.createInventory(createInventoryDto);
  }

  async findItemsByUserId(userId: number) {
    const inventory = await this.inventoryRepository.findOneByUserId(userId);
    if (!inventory) {
      throw new NotFoundException('유저의 인벤토리를 찾을 수 없습니다.');
    }
    const items = await this.itemRepository.findItemsByInventoryId(inventory.id);
    return items.map(item => ({
      id: item.id,
      count: item.count,
      storeItemName: item.store_item.name,
      storeItemImage: item.store_item.item_image,
      potion: item.store_item.potion,
      potionTime: item.store_item.potion_time,
    }));
  }
}
