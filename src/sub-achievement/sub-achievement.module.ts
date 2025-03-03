import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubAchievementService } from './sub-achievement.service';
import { SubAchievementController } from './sub-achievement.controller';
import { SubAchievementRepository } from './sub-achievement.repository';
import { SubAchievement } from './entities/sub-achievement.entity';
import { AchievementC } from '../achievement-c/entities/achievement-c.entity';
import { User } from '../user/entities/user.entity';
import { S3Service } from 'src/s3/s3.service';
import { ValkeyModule } from '../valkey/valkey.module';
import { ValkeyService } from 'src/valkey/valkey.service';
import { GeoModule } from '../geo/geo.module';
import { GeoService } from 'src/geo/geo.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubAchievement, AchievementC, User]),
    ValkeyModule,GeoModule
  ], // ✅ TypeOrmModule에 엔터티 추가
  controllers: [SubAchievementController],
  providers: [
    SubAchievementService,
    SubAchievementRepository,
    S3Service,
    ValkeyService,GeoService
  ], // ✅ Repository 등록
  exports: [SubAchievementService, SubAchievementRepository], // ✅ 다른 모듈에서 사용 가능하도록 export
})
export class SubAchievementModule {}
