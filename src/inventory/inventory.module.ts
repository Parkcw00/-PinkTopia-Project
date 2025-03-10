import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryRepository } from './inventory.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { Item } from '../item/entities/item.entity';
import { ItemRepository } from '../item/item.repository';
import { ValkeyModule } from '../valkey/valkey.module';
@Module({
  imports: [TypeOrmModule.forFeature([Inventory, Item]), ValkeyModule],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository, ItemRepository],
  exports: [InventoryService],
})
export class InventoryModule {}
