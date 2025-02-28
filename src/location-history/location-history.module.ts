import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationHistory } from './entities/location-history.entity';
import { LocationHistoryRepository } from './location-history.repository';
import { LocationHistoryService } from './location-history.service';
import { LocationHistoryController } from './location-history.controller';
import { ValkeyModule } from '../valkey/valkey.module';
import { ValkeyService } from 'src/valkey/valkey.service';
import { LocationHistoryGateway } from './location-history.gateway';
import { DirectionModule } from '../direction/direction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationHistory]),
    ValkeyModule,
    DirectionModule,
  ],
  controllers: [LocationHistoryController],
  providers: [
    LocationHistoryService,
    LocationHistoryRepository,
    LocationHistoryGateway,
    ValkeyService,
  ],
  exports: [LocationHistoryRepository],
})
export class LocationHistoryModule {}
