import { Module } from '@nestjs/common';
import { DirectionService } from './direction.service';
import { DirectionController } from './direction.controller';

@Module({
  controllers: [DirectionController],
  providers: [DirectionService],
})
export class DirectionModule {}
