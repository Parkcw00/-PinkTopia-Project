import { Module } from '@nestjs/common';
import { CatchPinkmongService } from './catch_pinkmong.service';
import { CatchPinkmongController } from './catch_pinkmong.controller';

@Module({
  controllers: [CatchPinkmongController],
  providers: [CatchPinkmongService],
})
export class CatchPinkmongModule {}
