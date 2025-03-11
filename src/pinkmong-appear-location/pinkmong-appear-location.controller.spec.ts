import { Test, TestingModule } from '@nestjs/testing';
import { PinkmongAppearLocationController } from './pinkmong-appear-location.controller';
import { PinkmongAppearLocationService } from 'src/pinkmong-appear-location/pinkmong-appear-location.service';
import { CreatePinkmongAppearLocationDto } from 'src/pinkmong-appear-location/dto/create-pinkmong-appear-location.dto';
import { UpdatePinkmongAppearLocationDto } from './dto/update-pinkmong-appear-location.dto';
import { PinkmongAppearLocation } from 'src/pinkmong-appear-location/entities/pinkmong-appear-location.entity';

describe('PinkmongAppearLocationController', () => {
  let controller: PinkmongAppearLocationController;
  let service: Partial<PinkmongAppearLocationService>;

  beforeEach(async () => {
    service = {
      fillValkey: jest.fn(),
      createLocation: jest.fn(),
      getAllLocations: jest.fn(),
      updateLocation: jest.fn(),
      deleteLocation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PinkmongAppearLocationController],
      providers: [
        {
          provide: PinkmongAppearLocationService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<PinkmongAppearLocationController>(
      PinkmongAppearLocationController,
    );
  });

  describe('fillValkey', () => {
    it('should call service.fillValkey and return its result', async () => {
      const result = {
        message: '✅ 5개의 Pinkmong 등장 위치가 Valkey에 저장되었습니다.',
      };
      (service.fillValkey as jest.Mock).mockResolvedValue(result);

      const response = await controller.fillValkey();
      expect(service.fillValkey).toHaveBeenCalled();
      expect(response).toEqual(result);
    });
  });

  describe('createLocation', () => {
    it('should call service.createLocation with dto and return the created location', async () => {
      const dto: CreatePinkmongAppearLocationDto = {
        title: 'Test Location',
        latitude: 10.0,
        longitude: 20.0,
        region_theme: 'forest', // 예시 값, 실제 DTO에 맞게 수정하세요.
      };

      const created: PinkmongAppearLocation = {
        id: 1,
        title: 'Test Location',
        latitude: 10.0,
        longitude: 20.0,
        region_theme: 'forest',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null as any,
        catchPinkmong: [], // 필수 속성을 빈 배열로 추가
      };

      (service.createLocation as jest.Mock).mockResolvedValue(created);

      const response = await controller.createLocation(dto);
      expect(service.createLocation).toHaveBeenCalledWith(dto);
      expect(response).toEqual(created);
    });
  });

  describe('getAllLocations', () => {
    it('should call service.getAllLocations and return an array of locations', async () => {
      const locations: PinkmongAppearLocation[] = [
        {
          id: 1,
          title: 'Location 1',
          latitude: 10.0,
          longitude: 20.0,
          region_theme: 'desert',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null as any,
          catchPinkmong: [],
        },
      ];
      (service.getAllLocations as jest.Mock).mockResolvedValue(locations);

      const response = await controller.getAllLocations();
      expect(service.getAllLocations).toHaveBeenCalled();
      expect(response).toEqual(locations);
    });
  });

  describe('updateLocation', () => {
    it('should call service.updateLocation with id and updateDto and return the updated location', async () => {
      const id = 1;
      const updateDto: UpdatePinkmongAppearLocationDto = {
        title: 'Updated Title',
        latitude: 15.0,
        longitude: 25.0,
        region_theme: 'ocean',
      };

      const updated: PinkmongAppearLocation = {
        id,
        title: 'Updated Title',
        latitude: 15.0,
        longitude: 25.0,
        region_theme: 'ocean',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null as any,
        catchPinkmong: [],
      };

      (service.updateLocation as jest.Mock).mockResolvedValue(updated);

      const response = await controller.updateLocation(id, updateDto);
      expect(service.updateLocation).toHaveBeenCalledWith(id, updateDto);
      expect(response).toEqual(updated);
    });
  });

  describe('deleteLocation', () => {
    it('should call service.deleteLocation with id and return void', async () => {
      const id = 1;
      (service.deleteLocation as jest.Mock).mockResolvedValue(undefined);

      const response = await controller.deleteLocation(id);
      expect(service.deleteLocation).toHaveBeenCalledWith(id);
      expect(response).toBeUndefined();
    });
  });
});
