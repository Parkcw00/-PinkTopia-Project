import { Test, TestingModule } from '@nestjs/testing';
import { LocationHistoryController } from './location-history.controller';
import { LocationHistoryService } from './location-history.service';
import { UserGuard } from '../user/guards/user-guard';

describe('LocationHistoryController', () => {
  let controller: LocationHistoryController;
  let service: LocationHistoryService;

  const fakeUser = { id: 1 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationHistoryController],
      providers: [
        {
          provide: LocationHistoryService,
          useValue: {
            createDefault: jest.fn(),
            updateValkey: jest.fn(),
            updateDB: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(UserGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LocationHistoryController>(
      LocationHistoryController,
    );
    service = module.get<LocationHistoryService>(LocationHistoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDB', () => {
    it('should call createDefault and return message and locationHistory', async () => {
      const fakeLocationHistory = [{ id: 1, name: 'Location 1' }];
      (service.createDefault as jest.Mock).mockResolvedValue(
        fakeLocationHistory,
      );

      const result = await controller.createDB(1);
      expect(service.createDefault).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        message: '기본 위치 데이터 생성 완료',
        locationHistory: fakeLocationHistory,
      });
    });
  });

  describe('updateValkey', () => {
    it('should call updateValkey and return success message', async () => {
      (service.updateValkey as jest.Mock).mockResolvedValue(undefined);
      const req = { user: fakeUser };
      const updateDto = { latitude: 37.1234, longitude: 127.5678 };

      const result = await controller.updateValkey(req, updateDto);
      expect(service.updateValkey).toHaveBeenCalledWith(fakeUser.id, updateDto);
      expect(result).toEqual({ message: 'valkey 업데이트 완료' });
    });
  });

  describe('updateDB', () => {
    it('should call updateDB and return success message', async () => {
      (service.updateDB as jest.Mock).mockResolvedValue(undefined);
      const req = { user: fakeUser };

      const result = await controller.updateDB(req);
      expect(service.updateDB).toHaveBeenCalledWith(fakeUser.id);
      expect(result).toEqual({ message: 'DB 최신화 완료' });
    });
  });
});
