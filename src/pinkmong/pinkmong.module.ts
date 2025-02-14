import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pinkmong } from './entities/pinkmong.entity';
import { PinkmongService } from './pinkmong.service';
import { PinkmongController } from './pinkmong.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pinkmong])],
  controllers: [PinkmongController],
  providers: [PinkmongService],
  exports: [PinkmongService],
})
export class PinkmongModule {}
