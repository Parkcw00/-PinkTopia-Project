import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './entities/item.entity';
import { UpdateItemDto } from './dto/update-item.dto';
import { plainToInstance } from 'class-transformer';
import { Inventory } from '../inventory/entities/inventory.entity';
import { CreateItemWithInventoryDto } from './dto/create-item-with-inventory.dto';

@Injectable()
export class ItemRepository {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async findAll(): Promise<Item[]> {
    return this.itemRepository.find();
  }

  async findOne(id: number) {
    return await this.inventoryRepository.findOne({ where: { id } });
  }

  async findOneByItemId(id: number) {
    return await this.itemRepository.findOne({ where: { id } });
  }

  async findOneByInventoryIdAndStoreItemId(
    inventoryId: number,
    storeItemId: number,
  ) {
    return await this.itemRepository.findOne({
      where: { inventory_id: inventoryId, store_item_id: storeItemId },
    });
  }

  async buyItem(createItemDto: CreateItemWithInventoryDto): Promise<Item> {
    const item = plainToInstance(Item, createItemDto);
    item.store_item_id = createItemDto.storeItemId;
    item.inventory_id = createItemDto.inventoryId;
    return this.itemRepository.save(item);
  }

  async updateItem(id: number, updateItemDto: UpdateItemDto) {
    const item = plainToInstance(Item, updateItemDto);
    await this.itemRepository.update(id, item);
    return this.findOne(id);
  }

  async deleteItem(id: number): Promise<void> {
    await this.itemRepository.delete(id);
  }

  async findItemsByInventoryId(inventoryId: number): Promise<Item[]> {
    return await this.itemRepository.find({
      where: { inventory_id: inventoryId },
      relations: ['store_item'],
    });
  }
}
