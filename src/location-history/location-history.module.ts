import { Module } from '@nestjs/common';
import { LocationHistoryService } from './location-history.service';
import { LocationHistoryController } from './location-history.controller';

@Module({
  controllers: [LocationHistoryController],
  providers: [LocationHistoryService],
})
export class LocationHistoryModule {}
