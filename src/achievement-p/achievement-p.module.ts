import { Module } from '@nestjs/common';
import { AchievementPService } from './achievement-p.service';
import { AchievementPController } from './achievement-p.controller';

@Module({
  controllers: [AchievementPController],
  providers: [AchievementPService],
})
export class AchievementPModule {}
