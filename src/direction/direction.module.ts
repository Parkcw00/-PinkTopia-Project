import { Module } from '@nestjs/common';
//import { DirectionRepository } from './direction.repository';
import { DirectionService } from './direction.service';
import { DirectionController } from './direction.controller';

import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { PinkmongAppearLocation } from '../pinkmong-appear-location/entities/pinkmong-appear-location.entity';
@Module({
  controllers: [DirectionController],
  providers: [DirectionService],
})
export class DirectionModule {}
