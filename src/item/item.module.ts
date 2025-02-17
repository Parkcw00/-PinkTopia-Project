import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { ItemRepository } from './item.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { StoreItemRepository } from 'src/store-item/store-item.repository';
import { StoreItem } from 'src/store-item/entities/store-item.entity';
import { InventoryRepository } from 'src/inventory/inventory.repository';
import { Inventory } from 'src/inventory/entities/inventory.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Item, StoreItem, Inventory])],
  controllers: [ItemController],
  providers: [ItemService, ItemRepository, StoreItemRepository, InventoryRepository],
})
export class ItemModule {}
