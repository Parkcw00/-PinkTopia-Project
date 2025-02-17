import { Injectable } from '@nestjs/common';
import { ItemRepository } from 'src/item/item.repository';
import { CreateItemDto } from 'src/item/dto/create-item.dto';
@Injectable()
export class InventoryService {
  constructor(
    private readonly itemRepository: ItemRepository,
  ) {}

  create(createItemDto: CreateItemDto) {
    return this.itemRepository.buyItem(createItemDto);
  }

  findAll() {
    return this.itemRepository.findAll();
  }

  findOne(id: number) {
    return this.itemRepository.findOne(id);
  }

}
