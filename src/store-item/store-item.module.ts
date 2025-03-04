import { Module } from '@nestjs/common';
import { StoreItemService } from './store-item.service';
import { StoreItemController } from './store-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreItem } from './entities/store-item.entity';
import { StoreItemRepository } from './store-item.repository';
import { S3Service } from '../s3/s3.service';
import { ValkeyService } from '../valkey/valkey.service'; // Valkey 추가
import { ValkeyModule } from '../valkey/valkey.module';

@Module({
  imports: [TypeOrmModule.forFeature([StoreItem]), ValkeyModule],
  controllers: [StoreItemController],
  providers: [StoreItemService, StoreItemRepository, S3Service, ValkeyService],
})
export class StoreItemModule {}
