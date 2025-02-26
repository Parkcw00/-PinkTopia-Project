import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectionRepository } from './direction.repository';
import { DirectionService } from './direction.service';
import { DirectionController } from './direction.controller';
import { PinkmongAppearLocationController } from '../pinkmong-appear-location/pinkmong-appear-location.controller';
import { S3Service } from 'src/s3/s3.service';
import { ValkeyModule } from '../valkey/valkey.module';
import { ValkeyService } from 'src/valkey/valkey.service';
import { SubAchievement } from '../sub-achievement/entities/sub-achievement.entity';
import { PinkmongAppearLocationModule} from '../pinkmong-appear-location/pinkmong-appear-location.module'





import { AchievementPModule } from '../achievement-p/achievement-p.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([SubAchievement]),
    ValkeyModule,AchievementPModule,PinkmongAppearLocationModule
    
  ], // ✅ TypeOrmModule에 엔터티 추가
  controllers: [DirectionController,PinkmongAppearLocationController],
  providers: [
    DirectionService,
    DirectionRepository,
    S3Service,
    ValkeyService,
    SubAchievement,
  ],
  exports: [DirectionService, DirectionRepository,],
})
export class DirectionModule {}
