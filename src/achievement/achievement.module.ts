import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Service } from 'src/s3/s3.service';
import { Achievement } from './entities/achievement.entity';
import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { AchievementC } from '../achievement-c/entities/achievement-c.entity';
import { AchievementRepository } from './achievement.repository';
import { User } from '../user/entities/user.entity';
import { ValkeyModule } from 'src/valkey/valkey.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([Achievement, SubAchievement, AchievementC, User]),
    ValkeyModule,
  ], // ✅ TypeOrmModule에 엔터티 추가
  controllers: [AchievementController],
  providers: [S3Service, AchievementService, AchievementRepository], // ✅ AchievementRepository 등록
  exports: [AchievementService, AchievementRepository], // ✅ 다른 모듈에서도 사용할 수 있도록 export
})
export class AchievementModule {}
