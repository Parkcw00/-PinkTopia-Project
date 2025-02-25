import { Module } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CollectionController } from './collection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { User } from 'src/user/entities/user.entity';
import { Pinkmong } from 'src/pinkmong/entities/pinkmong.entity';
import { ValkeyModule } from 'src/valkey/valkey.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Collection, User, Pinkmong]),
    ValkeyModule,
  ],
  controllers: [CollectionController],
  providers: [CollectionService],
})
export class CollectionModule {}
