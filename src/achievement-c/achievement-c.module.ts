import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementCService } from './achievement-c.service';
import { AchievementCController } from './achievement-c.controller';
import { AchievementCRepository } from './achievement-c.repository';
import { AchievementC } from './entities/achievement-c.entity';
import { AchievementP } from '../achievement-p/entities/achievement-p.entity'; // ✅ AchievementP도 추가

@Module({
  imports: [TypeOrmModule.forFeature([AchievementC, AchievementP])], // ✅ TypeOrmModule에 엔터티 추가
  controllers: [AchievementCController],
  providers: [AchievementCService, AchievementCRepository], // ✅ Repository 등록
  exports: [AchievementCService, AchievementCRepository], // ✅ 다른 모듈에서 사용 가능하도록 export
})
export class AchievementCModule {}
