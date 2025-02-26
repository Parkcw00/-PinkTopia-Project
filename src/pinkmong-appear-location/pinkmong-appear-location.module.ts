import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PinkmongAppearLocationService } from './pinkmong-appear-location.service';
import { PinkmongAppearLocationController } from './pinkmong-appear-location.controller';
import { PinkmongAppearLocationRepository } from './pinkmong-appear-location.repository';
import { PinkmongAppearLocation } from './entities/pinkmong-appear-location.entity';
import { ValkeyService } from '../valkey/valkey.service';
import {DirectionModule} from '../direction/direction.module'

@Module({
  imports: [TypeOrmModule.forFeature([PinkmongAppearLocation]),DirectionModule],
  controllers: [PinkmongAppearLocationController],
  providers: [
    PinkmongAppearLocationService,
    PinkmongAppearLocationRepository,
    ValkeyService,
  ],exports:[PinkmongAppearLocationService,
    PinkmongAppearLocationRepository,]
})
export class PinkmongAppearLocationModule {}
