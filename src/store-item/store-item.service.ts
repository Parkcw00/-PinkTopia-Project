import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStoreItemDto } from './dto/create-store-item.dto';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';
import { StoreItem } from './entities/store-item.entity';
import { StoreItemRepository } from './store-item.repository';

@Injectable()
export class StoreItemService {
  constructor(
    private storeItemRepository: StoreItemRepository,
    ) {}

  async addShopItem(createStoreItemDto: CreateStoreItemDto): Promise<StoreItem> {
    const storeItem = await this.storeItemRepository.addShopItem(createStoreItemDto);
    return storeItem;
  }

  async findAll(): Promise<StoreItem[]> {
    return this.storeItemRepository.findAll();
  }

  async findOne(id: number): Promise<StoreItem> {
    const storeItem = await this.storeItemRepository.storeItemFindOne(id);
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }
    return storeItem;
  }

  async updateStoreItem(id: number, updateStoreItemDto: UpdateStoreItemDto): Promise<StoreItem | null> {
    const storeItem = await this.storeItemRepository.storeItemFindOne(id);
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }

    return this.storeItemRepository.updateStoreItem(id, updateStoreItemDto);
  }

  async deleteStoreItem(id: number) {  
    const storeItem = await this.storeItemRepository.storeItemFindOne(id);
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }

    return this.storeItemRepository.deleteStoreItem(id);
  }
}
