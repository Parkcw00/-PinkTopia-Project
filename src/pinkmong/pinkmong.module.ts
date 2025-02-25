import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pinkmong } from './entities/pinkmong.entity';
import { PinkmongService } from './pinkmong.service';
import { PinkmongController } from './pinkmong.controller';
import { PinkmongRepository } from './pinkmong.repository';
import { S3Service } from 'src/s3/s3.service';
import { ValkeyModule } from 'src/valkey/valkey.module';

@Module({
  imports: [TypeOrmModule.forFeature([Pinkmong]), ValkeyModule],
  controllers: [PinkmongController],
  providers: [PinkmongService, PinkmongRepository, S3Service], //핑크몽 레포지토리 추가
  exports: [PinkmongRepository],
})
export class PinkmongModule {}
