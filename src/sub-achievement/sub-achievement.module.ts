import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAchievementService } from './sub-achievement.service';
import { SubAchievementController } from './sub-achievement.controller';
import { SubAchievementRepository } from './sub-achievement.repository';
import { SubAchievement } from './entities/sub-achievement.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubAchievement,User])], // ✅ TypeOrmModule에 엔터티 추가
  controllers: [SubAchievementController],
  providers: [SubAchievementService, SubAchievementRepository], // ✅ Repository 등록
  exports: [SubAchievementService, SubAchievementRepository], // ✅ 다른 모듈에서 사용 가능하도록 export
})
export class SubAchievementModule {}
