import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { ItemRepository } from './item.repository';
import { StoreItemRepository } from '../store-item/store-item.repository';
import { Item } from './entities/item.entity';
import { InventoryRepository } from '../inventory/inventory.repository';
import { UpdateItemDto } from './dto/update-item.dto';
import { UserRepository } from '../user/user.repository';
import { CreateItemWithInventoryDto } from './dto/create-item-with-inventory.dto';
import { ValkeyService } from '../valkey/valkey.service';

@Injectable()
export class ItemService {
  constructor(
    private readonly itemRepository: ItemRepository,
    private readonly storeItemRepository: StoreItemRepository,
    private readonly inventoryRepository: InventoryRepository,
    private readonly userRepository: UserRepository,
    private readonly valkeyService: ValkeyService,
  ) {}

  async purchaseItem(
    userId: number,
    createItemDto: CreateItemDto,
  ): Promise<{ item: Item; message: string }> {
    const { storeItemId, count, paymentMethod } = createItemDto;

    // StoreItem 테이블에서 아이템 확인
    const storeItem =
      await this.storeItemRepository.storeItemFindOne(storeItemId);
    if (!storeItem) {
      throw new NotFoundException('상점에 존재하지 않는 아이템입니다.');
    }

    // 유저가 가지고 있는 gem과 다이아몬드 확인
    const user = await this.userRepository.findUserId(userId);
    if (!user) {
      throw new NotFoundException('유저가 존재하지 않습니다.');
    }

    const gemCost = storeItem.gem_price * count;
    const diaCost = storeItem.dia_price * count;

    if (paymentMethod === 'gem') {
      if (user.pink_gem < gemCost) {
        throw new NotFoundException('현재 보유하고 있는 젬이 부족합니다.');
      }
      user.pink_gem -= gemCost;
      await this.userRepository.updateUser(userId, { pink_gem: user.pink_gem });
      console.log('젬으로 결제 완료');
    } else if (paymentMethod === 'dia') {
      if (user.pink_dia < diaCost) {
        throw new NotFoundException(
          '현재 보유하고 있는 다이아몬드가 부족합니다.',
        );
      }
      user.pink_dia -= diaCost;
      await this.userRepository.updateUser(userId, { pink_dia: user.pink_dia });
      console.log('다이아몬드로 결제 완료');
    } else {
      throw new NotFoundException('유효하지 않은 결제 수단입니다.');
    }

    // 유저의 인벤토리 가져오기
    const inventory = await this.inventoryRepository.findOneByUserId(userId);
    if (!inventory) {
      throw new NotFoundException('유저의 인벤토리를 찾을 수 없습니다.');
    }

    // 기존 아이템 확인 및 처리
    const item = await this.itemRepository.findOneByInventoryIdAndStoreItemId(
      inventory.id,
      storeItemId,
    );
    if (item) {
      if (item.count + count >= 100) {
        throw new NotFoundException(
          '아이템 수량은 최대 99개까지만 구매할 수 있습니다.',
        );
      }
      item.count += count;
      await this.itemRepository.updateItem(item.id, { count: item.count });
      await this.valkeyService.del(`invenItems:`);
      return {
        item: item,
        message: `${storeItem.name} ${count}개를 구매하였습니다. 남아있는 젬 ${user.pink_gem}개, 남아있는 다이아몬드 ${user.pink_dia}개`,
      };
    } else {
      if (count >= 100) {
        throw new NotFoundException(
          '아이템 수량은 최대 99개까지만 구매할 수 있습니다.',
        );
      }
      const newItem = await this.itemRepository.buyItem({
        ...createItemDto,
        inventoryId: Number(inventory.id),
      } as CreateItemWithInventoryDto);
      await this.valkeyService.del(`invenItems:`);
      return {
        item: newItem,
        message: `${storeItem.name} ${count}개를 구매하였습니다. 남아있는 젬 ${user.pink_gem}개, 남아있는 다이아몬드 ${user.pink_dia}개`,
      };
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
    console.log(
      `🔍 [판매 요청] 유저ID: ${userId}, 아이템ID: ${id}, 판매 수량: ${sellCount}`,
    );

    const inventory = await this.inventoryRepository.findOneByUserId(userId);
    if (!inventory) {
      throw new NotFoundException('❌ 인벤토리를 찾을 수 없습니다.');
    }

    const item = await this.itemRepository.findOneByItemId(id);
    if (!item) {
      throw new NotFoundException('❌ 아이템을 찾을 수 없습니다.');
    }

    if (item.inventory_id === inventory.id) {
      const storeItemId = item.store_item_id;
      const storeItem =
        await this.storeItemRepository.storeItemFindOne(storeItemId);
      if (!storeItem) {
        throw new NotFoundException('❌ 상점에 존재하지 않는 아이템입니다.');
      }

      if (item.count < sellCount) {
        throw new NotFoundException(
          '❌ 보유한 아이템보다 많은 수량을 판매할 수 없습니다.',
        );
      }

      item.count -= sellCount;

      if (item.count === 0) {
        await this.itemRepository.deleteItem(id);
      } else {
        await this.itemRepository.updateItem(id, { count: item.count });
      }

      const refundGem = storeItem.gem_price * sellCount * 0.5;
      const user = await this.userRepository.findUserId(userId);
      if (user) {
        user.pink_gem += refundGem;
        await this.userRepository.updateUser(userId, {
          pink_gem: user.pink_gem,
        });
        console.log(`💰 [젬 환불] ${refundGem} 젬 추가됨`);
      } else {
        throw new NotFoundException('❌ 유저가 존재하지 않습니다.');
      }

      await this.valkeyService.del(`invenItems:`);

      const updatedInventory =
        await this.inventoryRepository.findOneByUserId(userId);

      return {
        message: `${storeItem.name} ${sellCount}개를 판매하였습니다. 젬 ${refundGem}개를 환불 받았습니다.`,
      };
    } else {
      throw new NotFoundException('❌ 본인의 아이템만 판매할 수 있습니다.');
    }
  }
}
