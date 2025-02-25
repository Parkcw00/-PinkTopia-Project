import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementPService } from './achievement-p.service';
import { AchievementPController } from './achievement-p.controller';
import { AchievementPRepository } from './achievement-p.repository';
import { AchievementP } from './entities/achievement-p.entity'; // ✅ 엔터티 추가
import { User } from '../user/entities/user.entity';
import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { AchievementC } from '../achievement-c/entities/achievement-c.entity';
import { Achievement } from '../achievement/entities/achievement.entity';
import { ValkeyModule } from '../valkey/valkey.module';
import { ValkeyService } from 'src/valkey/valkey.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AchievementP,
      User,
      SubAchievement,
      AchievementC,
      Achievement,
    ]),
    ValkeyModule,
  ], // ✅ TypeORM 모듈에 AchievementP 등록
  controllers: [AchievementPController],
  providers: [ValkeyService, AchievementPService, AchievementPRepository], // ✅ Repository 등록
  exports: [AchievementPService, AchievementPRepository], // ✅ 다른 모듈에서 사용 가능하도록 export
})
export class AchievementPModule {}
