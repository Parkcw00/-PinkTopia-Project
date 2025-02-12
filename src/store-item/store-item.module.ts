import { Module } from '@nestjs/common';
import { StoreItemService } from './store-item.service';
import { StoreItemController } from './store-item.controller';

@Module({
  controllers: [StoreItemController],
  providers: [StoreItemService],
})
export class StoreItemModule {}
