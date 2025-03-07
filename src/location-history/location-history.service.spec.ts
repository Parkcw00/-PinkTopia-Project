import { LocationHistoryService } from './location-history.service';
import { UpdateLocationHistoryDto } from './dto/update-location-history.dto';
import { LocationHistory } from './entities/location-history.entity';

describe('LocationHistoryService', () => {
  let service: LocationHistoryService;
  let repository: Partial<{
    create7: jest.Mock;
    findOldestByUserId: jest.Mock;
    save: jest.Mock;
  }>;
  let valkeyService: Partial<{
    del: jest.Mock;
    set: jest.Mock;
    get: jest.Mock;
  }>;

  const user_id = 1;

  beforeEach(() => {
    repository = {
      create7: jest.fn(),
      findOldestByUserId: jest.fn(),
      save: jest.fn(),
    };

    valkeyService = {
      del: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
    };

    service = new LocationHistoryService(
      repository as any,
      valkeyService as any,
    );
  });

  describe('createDefault', () => {
    it('should create 7 default records and update Valkey', async () => {
      // repository.create7는 매 호출마다 새로운 LocationHistory 객체를 반환한다고 가정
      const fakeRecord = (i: number): LocationHistory =>
        ({
          id: i,
          user_id,
          latitude: 0,
          longitude: 0,
          timestamp: new Date(),
        }) as LocationHistory;

      (repository.create7 as jest.Mock)
        .mockImplementationOnce(() => Promise.resolve(fakeRecord(1)))
        .mockImplementationOnce(() => Promise.resolve(fakeRecord(2)))
        .mockImplementationOnce(() => Promise.resolve(fakeRecord(3)))
        .mockImplementationOnce(() => Promise.resolve(fakeRecord(4)))
        .mockImplementationOnce(() => Promise.resolve(fakeRecord(5)))
        .mockImplementationOnce(() => Promise.resolve(fakeRecord(6)))
        .mockImplementationOnce(() => Promise.resolve(fakeRecord(7)));

      const result = await service.createDefault(user_id);
      expect(repository.create7).toHaveBeenCalledTimes(7);
      expect(valkeyService.del).toHaveBeenCalledWith(
        `LocationHistory:${user_id}`,
      );
      expect(valkeyService.set).toHaveBeenCalledWith(
        `LocationHistory:${user_id}`,
        result,
      );
      expect(result).toHaveLength(7);
    });
  });

  describe('updateValkey', () => {
    it('should update Valkey when no existing records in cache', async () => {
      // valkeyService.get에서 데이터가 없거나 파싱에 실패하여 records가 빈 배열인 상황
      (valkeyService.get as jest.Mock).mockResolvedValue(null);

      const updateDto: UpdateLocationHistoryDto = {
        latitude: 37.1234,
        longitude: 127.5678,
        timestamp: new Date('2023-01-01T00:00:00.000Z'),
      };

      await service.updateValkey(user_id, updateDto);

      // records.length === 0 이므로 updateDto를 바로 push한 후 cache 저장
      // set() 호출 시 저장하는 데이터는 JSON.stringify 된 배열이어야 함.
      expect(valkeyService.set).toHaveBeenCalledWith(
        `LocationHistory:${user_id}`,
        expect.stringMatching(/"latitude":\s*37\.1234/),
      );
    });

    it('should update Valkey when existing records are less than 7', async () => {
      // 기존에 3개의 위치 기록이 존재하는 상황
      const existingRecords = [
        {
          latitude: 35.0,
          longitude: 128.0,
          timestamp: new Date('2023-01-01T00:00:00.000Z'),
        },
        {
          latitude: 36.0,
          longitude: 129.0,
          timestamp: new Date('2023-01-02T00:00:00.000Z'),
        },
        {
          latitude: 37.0,
          longitude: 130.0,
          timestamp: new Date('2023-01-03T00:00:00.000Z'),
        },
      ];
      (valkeyService.get as jest.Mock).mockResolvedValue(
        JSON.stringify(existingRecords),
      );

      const updateDto: UpdateLocationHistoryDto = {
        latitude: 38.1234,
        longitude: 131.5678,
        timestamp: new Date('2023-01-04T00:00:00.000Z'),
      };

      await service.updateValkey(user_id, updateDto);

      // 기존 레코드에 updateDto가 push되어 총 4개의 기록이 되어야 함
      const expectedRecords = [...existingRecords, updateDto];
      expect(valkeyService.set).toHaveBeenCalledWith(
        `LocationHistory:${user_id}`,
        JSON.stringify(expectedRecords),
      );
    });

    it('should update Valkey when existing records are 7 (rotate records)', async () => {
      // 기존에 7개의 기록이 존재하는 상황
      const existingRecords = Array.from({ length: 7 }, (_, i) => ({
        latitude: 30 + i,
        longitude: 120 + i,
        timestamp: new Date(`2023-01-0${i + 1}T00:00:00.000Z`),
      }));
      (valkeyService.get as jest.Mock).mockResolvedValue(
        JSON.stringify(existingRecords),
      );

      const updateDto: UpdateLocationHistoryDto = {
        latitude: 40.1234,
        longitude: 140.5678,
        timestamp: new Date('2023-01-08T00:00:00.000Z'),
      };

      await service.updateValkey(user_id, updateDto);

      // 기존 배열에서 가장 오래된 항목이 shift되어 새 updateDto가 push되어야 함
      const expectedRecords = [...existingRecords.slice(1), updateDto];
      expect(valkeyService.set).toHaveBeenCalledWith(
        `LocationHistory:${user_id}`,
        JSON.stringify(expectedRecords),
      );
    });
  });

  describe('updateDB', () => {
    it('should update DB when Valkey has valid records', async () => {
      // valkeyService.get에서 유효한 JSON 문자열을 반환하는 경우
      const recordsFromValkey = [
        {
          latitude: 37.5,
          longitude: 127.5,
          timestamp: '2023-01-10T00:00:00.000Z',
        },
      ];
      (valkeyService.get as jest.Mock).mockResolvedValue(
        JSON.stringify(recordsFromValkey),
      );

      // repository.findOldestByUserId가 기존 기록을 반환하는 상황
      const oldestRecord = {
        id: 1,
        user_id,
        latitude: 0,
        longitude: 0,
        timestamp: new Date('2022-01-01T00:00:00.000Z'),
      };
      (repository.findOldestByUserId as jest.Mock).mockResolvedValue(
        oldestRecord,
      );
      (repository.save as jest.Mock).mockResolvedValue({
        ...oldestRecord,
        latitude: 37.5,
        longitude: 127.5,
        timestamp: new Date('2023-01-10T00:00:00.000Z'),
      });

      await service.updateDB(user_id);

      expect(valkeyService.get).toHaveBeenCalledWith(
        `LocationHistory:${user_id}`,
      );
      expect(repository.findOldestByUserId).toHaveBeenCalledWith(user_id);
      expect(repository.save).toHaveBeenCalled();

      // 업데이트된 oldestRecord의 값이 변경되었는지 확인 (timestamp는 ISO 문자열 비교)
      const savedRecord = (repository.save as jest.Mock).mock.calls[0][0];
      expect(savedRecord.latitude).toEqual(37.5);
      expect(savedRecord.longitude).toEqual(127.5);
      expect(new Date(savedRecord.timestamp).toISOString()).toEqual(
        new Date('2023-01-10T00:00:00.000Z').toISOString(),
      );
    });

    it('should not update DB when Valkey returns no records', async () => {
      // valkeyService.get에서 빈 배열 또는 null 반환
      (valkeyService.get as jest.Mock).mockResolvedValue(null);

      // updateDB 내부에서 records.length === 0 인 경우 업데이트 중단하므로 repository.findOldestByUserId는 호출되지 않아야 함.
      await service.updateDB(user_id);
      expect(repository.findOldestByUserId).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});
