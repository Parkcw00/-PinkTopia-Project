import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectionRepository } from './direction.repository';
import { DirectionService } from './direction.service';
import { DirectionController } from './direction.controller';

import { S3Service } from 'src/s3/s3.service';
import { ValkeyModule } from '../valkey/valkey.module';
import { ValkeyService } from 'src/valkey/valkey.service';
import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { PinkmongAppearLocation } from '../pinkmong-appear-location/entities/pinkmong-appear-location.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([SubAchievement, PinkmongAppearLocation]),
    ValkeyModule,
  ], // ✅ TypeOrmModule에 엔터티 추가
  controllers: [DirectionController],
  providers: [
    DirectionService,
    DirectionRepository,
    S3Service,
    ValkeyService,
    SubAchievement,
    PinkmongAppearLocation,
  ],
  exports: [DirectionService, DirectionRepository],
})
export class DirectionModule {}
