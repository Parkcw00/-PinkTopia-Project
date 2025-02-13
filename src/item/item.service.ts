import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemRepository } from './item.repository';
import { StoreItemRepository } from '../store-item/store-item.repository';
import { StoreItem } from '../store-item/entities/store-item.entity';
// import { UserInfo } from 'src/auth/user-info.decorator';

@Injectable()
export class ItemService {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly storeItemRepository: StoreItemRepository,
  ) {}

  async findStoreItemById(storeItemId: number): Promise<StoreItem | null> {
    return this.storeItemRepository.findOne(storeItemId);
  }

  async purchaseItem(/*userInfo: UserInfo,*/ createItemDto: CreateItemDto) {
    const { storeItemId } = createItemDto;
    const storeItem = await this.storeItemRepository.findOne(storeItemId);
    if (!storeItem) {
      throw new NotFoundException('상점에 존재하지 않는 아이템입니다.');
    }
    return this.itemRepository.buyItem(createItemDto);
  }

  async findAll() {
    return await this.itemRepository.findAll();
  }

  async findOne(id: number) {
    return await this.itemRepository.findOne(id);
  }

  // async update(id: number, updateItemDto: UpdateItemDto) {
  //   const item = await this.itemRepository.findOne(id);
  // if (!item) {
  //   throw new NotFoundException('아이템을 찾을 수 없습니다.');
  // }

  // // 수량 감소 로직
  // if (updateItemDto.count && item.count < updateItemDto.count) {
  //   throw new Error('아이템 수량이 부족합니다.');
  // }

  // item.count -= updateItemDto.count || 0;

  // return this.itemRepository.updateItem(id, { ...updateItemDto, count: item.count });
  // }

  async sellItem(id: number) {
    const item = await this.itemRepository.findOne(id);
    if (!item) {
      throw new NotFoundException('아이템을 찾을 수 없습니다.');
    }

    const storeItem = await this.storeItemRepository.findOne(item.store_item.id);
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
      await this.itemRepository.deleteItem(id);
    } else {
      await this.itemRepository.updateItem(id, { count: item.count });
    }

    return { refundAmount };
  }

}
