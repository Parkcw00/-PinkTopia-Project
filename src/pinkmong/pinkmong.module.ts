import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pinkmong } from './entities/pinkmong.entity';
import { PinkmongService } from './pinkmong.service';
import { PinkmongController } from './pinkmong.controller';
import { PinkmongRepository } from './pinkmong.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Pinkmong])],
  controllers: [PinkmongController],
  providers: [PinkmongService, PinkmongRepository], //핑크몽 레포지토리 추가
  exports: [PinkmongRepository],
})
export class PinkmongModule {}
