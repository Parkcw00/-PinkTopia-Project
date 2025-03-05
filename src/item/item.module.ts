import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { ItemRepository } from './item.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { StoreItemRepository } from '../store-item/store-item.repository';
import { StoreItem } from '../store-item/entities/store-item.entity';
import { InventoryRepository } from '../inventory/inventory.repository';
import { Inventory } from '../inventory/entities/inventory.entity';
import { ValkeyModule } from '../valkey/valkey.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Item, StoreItem, Inventory]),
    ValkeyModule,
  ],
  controllers: [ItemController],
  providers: [
    ItemService,
    ItemRepository,
    StoreItemRepository,
    InventoryRepository,
  ],
})
export class ItemModule {}
