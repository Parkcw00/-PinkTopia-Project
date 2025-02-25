import { Module } from '@nestjs/common';
import { StoreItemService } from './store-item.service';
import { StoreItemController } from './store-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreItem } from './entities/store-item.entity';
import { StoreItemRepository } from './store-item.repository';
import { S3Service } from 'src/s3/s3.service';
import { ValkeyModule } from 'src/valkey/valkey.module';

@Module({
  imports: [TypeOrmModule.forFeature([StoreItem]), ValkeyModule],
  controllers: [StoreItemController],
  providers: [StoreItemService, StoreItemRepository, S3Service],
})
export class StoreItemModule {}
