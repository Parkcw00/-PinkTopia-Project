import { LocationHistoryGateway } from './location-history.gateway';
import { LocationHistoryService } from './location-history.service';
import { DirectionService } from '../direction/direction.service';
import { Socket } from 'socket.io';

describe('LocationHistoryGateway', () => {
  let gateway: LocationHistoryGateway;
  let locationHistoryService: Partial<LocationHistoryService>;
  let directionService: Partial<DirectionService>;
  let mockClient: Partial<Socket>;

  beforeEach(() => {
    locationHistoryService = {
      updateValkey: jest.fn().mockResolvedValue(undefined),
      updateDB: jest.fn().mockResolvedValue(undefined),
    };

    directionService = {
      compareBookmark: jest.fn().mockResolvedValue(undefined),
    };

    mockClient = {
      emit: jest.fn(),
    };

    gateway = new LocationHistoryGateway(
      locationHistoryService as LocationHistoryService,
      directionService as DirectionService,
    );
  });

  describe('handleLocationUpdateValkey', () => {
    it('should update valkey, call compareBookmark, and emit locationUpdated event', async () => {
      const data = { userId: 42, latitude: 12.34, longitude: 56.78 };

      await gateway.handleLocationUpdateValkey(data, mockClient as Socket);

      // updateValkey가 올바른 인수로 호출되었는지 확인
      expect(locationHistoryService.updateValkey).toHaveBeenCalledWith(42, {
        latitude: 12.34,
        longitude: 56.78,
      });

      // compareBookmark가 올바른 인수로 호출되었는지 확인
      expect(directionService.compareBookmark).toHaveBeenCalledWith(
        42,
        12.34,
        56.78,
        mockClient,
      );

      // 클라이언트에 "locationUpdated" 이벤트 전송 확인
      expect(mockClient.emit).toHaveBeenCalledWith('locationUpdated', {
        message: '위치 업데이트 완료',
      });
    });
  });

  describe('handleLocationUpdateDB', () => {
    it('should update DB and emit locationUpdated event', async () => {
      const data = { userId: 42 };

      await gateway.handleLocationUpdateDB(data, mockClient as Socket);

      // updateDB가 올바른 인수로 호출되었는지 확인
      expect(locationHistoryService.updateDB).toHaveBeenCalledWith(42);
      // 클라이언트에 "locationUpdated" 이벤트 전송 확인
      expect(mockClient.emit).toHaveBeenCalledWith('locationUpdated', {
        message: '위치 업데이트 완료',
      });
    });
  });
});
