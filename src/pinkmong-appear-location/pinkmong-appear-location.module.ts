import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PinkmongAppearLocationService } from './pinkmong-appear-location.service';
import { PinkmongAppearLocationController } from './pinkmong-appear-location.controller';
import { PinkmongAppearLocationRepository } from './pinkmong-appear-location.repository';
import { PinkmongAppearLocation } from './entities/pinkmong-appear-location.entity';
import { ValkeyService } from 'src/valkey/valkey.service';

@Module({
  imports: [TypeOrmModule.forFeature([PinkmongAppearLocation])],
  controllers: [PinkmongAppearLocationController],
  providers: [
    PinkmongAppearLocationService,
    PinkmongAppearLocationRepository,
    ValkeyService,
  ],
})
export class PinkmongAppearLocationModule {}
