import { LocationHistoryRepository } from './location-history.repository';
import { Repository } from 'typeorm';
import { LocationHistory } from './entities/location-history.entity';

describe('LocationHistoryRepository', () => {
  let locationHistoryRepo: LocationHistoryRepository;
  let mockEntity: Partial<Repository<LocationHistory>>;

  beforeEach(() => {
    // Repository의 메서드를 jest.fn()으로 모킹
    mockEntity = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    locationHistoryRepo = new LocationHistoryRepository(
      mockEntity as Repository<LocationHistory>,
    );
  });

  describe('create7', () => {
    it('should create and save a new location history record', async () => {
      const user_id = 1;
      const latitude = 12.34;
      const longitude = 56.78;
      const timestamp = new Date('2023-01-01T00:00:00.000Z');
      const fakeRecord: LocationHistory = {
        id: 1,
        user_id,
        latitude,
        longitude,
        timestamp,
      } as LocationHistory;

      (mockEntity.create as jest.Mock).mockReturnValue(fakeRecord);
      (mockEntity.save as jest.Mock).mockResolvedValue(fakeRecord);

      const result = await locationHistoryRepo.create7(
        user_id,
        latitude,
        longitude,
        timestamp,
      );

      expect(mockEntity.create).toHaveBeenCalledWith({
        user_id,
        latitude,
        longitude,
        timestamp,
      });
      expect(mockEntity.save).toHaveBeenCalledWith(fakeRecord);
      expect(result).toEqual(fakeRecord);
    });
  });

  describe('getLogin', () => {
    it('should return an array of location histories for the given user', async () => {
      const user_id = 1;
      const fakeRecords: LocationHistory[] = [
        {
          id: 1,
          user_id,
          latitude: 0,
          longitude: 0,
          timestamp: new Date(),
        } as LocationHistory,
      ];
      (mockEntity.find as jest.Mock).mockResolvedValue(fakeRecords);

      const result = await locationHistoryRepo.getLogin(user_id);
      expect(mockEntity.find).toHaveBeenCalledWith({
        where: { user_id },
        order: { timestamp: 'ASC' },
      });
      expect(result).toEqual(fakeRecords);
    });
  });

  describe('findOldestByUserId', () => {
    it('should return the oldest location history record for the given user', async () => {
      const user_id = 1;
      const oldestRecord: LocationHistory = {
        id: 1,
        user_id,
        latitude: 0,
        longitude: 0,
        timestamp: new Date('2022-01-01T00:00:00.000Z'),
      } as LocationHistory;
      (mockEntity.findOne as jest.Mock).mockResolvedValue(oldestRecord);

      const result = await locationHistoryRepo.findOldestByUserId(user_id);
      expect(mockEntity.findOne).toHaveBeenCalledWith({
        where: { user_id },
        order: { timestamp: 'ASC' },
      });
      expect(result).toEqual(oldestRecord);
    });
  });

  describe('save', () => {
    it('should save and return the given location history record', async () => {
      const record: LocationHistory = {
        id: 1,
        user_id: 1,
        latitude: 0,
        longitude: 0,
        timestamp: new Date(),
      } as LocationHistory;
      (mockEntity.save as jest.Mock).mockResolvedValue(record);

      const result = await locationHistoryRepo.save(record);
      expect(mockEntity.save).toHaveBeenCalledWith(record);
      expect(result).toEqual(record);
    });
  });

  describe('getAllUserIds', () => {
    it('should return an array of distinct user_ids', async () => {
      const rawUsers = [{ user_id: 1 }, { user_id: 2 }, { user_id: 3 }];

      // 모킹할 QueryBuilder 체인 생성
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(rawUsers),
      };

      (mockEntity.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );

      const result = await locationHistoryRepo.getAllUserIds();
      expect(mockEntity.createQueryBuilder).toHaveBeenCalledWith(
        'location_history',
      );
      expect(mockQueryBuilder.select).toHaveBeenCalledWith('DISTINCT user_id');
      expect(result).toEqual([1, 2, 3]);
    });
  });
});
