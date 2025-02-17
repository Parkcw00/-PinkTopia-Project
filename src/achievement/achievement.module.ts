import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { AchievementC } from '../achievement-c/entities/achievement-c.entity';
import { AchievementRepository } from './achievement.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement, SubAchievement, AchievementC])], // ✅ TypeOrmModule에 엔터티 추가
  controllers: [AchievementController],
  providers: [AchievementService, AchievementRepository], // ✅ AchievementRepository 등록
  exports: [AchievementService, AchievementRepository], // ✅ 다른 모듈에서도 사용할 수 있도록 export
  
})
export class AchievementModule {}
