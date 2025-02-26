import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PinkmongAppearLocationService } from './pinkmong-appear-location.service';
import { PinkmongAppearLocationController } from './pinkmong-appear-location.controller';
import { PinkmongAppearLocationRepository } from './pinkmong-appear-location.repository';
import { PinkmongAppearLocation } from './entities/pinkmong-appear-location.entity';
import { ValkeyService } from '../valkey/valkey.service';
import { DirectionModule } from '../direction/direction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PinkmongAppearLocation]),
    forwardRef(() => DirectionModule), //forwardRef()는 NestJS에서 순환 의존성(circular dependency) 문제를 해결하기 위해 제공하는 함수
  ],
  controllers: [PinkmongAppearLocationController],
  providers: [
    PinkmongAppearLocationService,
    PinkmongAppearLocationRepository,
    ValkeyService,
  ],
  exports: [PinkmongAppearLocationService, PinkmongAppearLocationRepository],
})
export class PinkmongAppearLocationModule {}
