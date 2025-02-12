import { Module } from '@nestjs/common';
import { AchievementCService } from './achievement-c.service';
import { AchievementCController } from './achievement-c.controller';

@Module({
  controllers: [AchievementCController],
  providers: [AchievementCService],
})
export class AchievementCModule {}
