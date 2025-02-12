import { Module } from '@nestjs/common';
import { StoreItemService } from './store-item.service';
import { StoreItemController } from './store-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreItem } from './entities/store-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreItem])],
  controllers: [StoreItemController],
  providers: [StoreItemService],
})
export class StoreItemModule {}
