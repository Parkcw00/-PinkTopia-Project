import { Module } from '@nestjs/common';
import { PinkmongService } from './pinkmong.service';
import { PinkmongController } from './pinkmong.controller';

@Module({
  controllers: [PinkmongController],
  providers: [PinkmongService],
})
export class PinkmongModule {}
