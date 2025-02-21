import { Module } from '@nestjs/common';
import { PinkmongAppearLocationService } from './pinkmong-appear-location.service';
import { PinkmongAppearLocationController } from './pinkmong-appear-location.controller';

@Module({
  controllers: [PinkmongAppearLocationController],
  providers: [PinkmongAppearLocationService],
})
export class PinkmongAppearLocationModule {}
