import { Module } from '@nestjs/common';
import { CatchPinkmongService } from './catch_pinkmong.service';
import { CatchPinkmongController } from './catch_pinkmong.controller';
import { CatchPinkmong } from './entities/catch_pinkmong.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Pinkmong } from 'src/pinkmong/entities/pinkmong.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Item } from 'src/item/entities/item.entity';
import { Collection } from 'src/collection/entities/collection.entity';
import { ValkeyService } from 'src/valkey/valkey.service';
import { CatchPinkmongRepository } from './catch_pinkmong.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CatchPinkmong,
      User,
      Pinkmong,
      Inventory,
      Item,
      Collection,
    ]),
  ],
  controllers: [CatchPinkmongController],
  providers: [CatchPinkmongService, CatchPinkmongRepository, ValkeyService],
})
export class CatchPinkmongModule {}
