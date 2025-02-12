import { Module } from '@nestjs/common';
import { SubAchievementService } from './sub-achievement.service';
import { SubAchievementController } from './sub-achievement.controller';

@Module({
  controllers: [SubAchievementController],
  providers: [SubAchievementService],
})
export class SubAchievementModule {}
