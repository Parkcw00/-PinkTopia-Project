import { NotFoundException } from '@nestjs/common';
import { PinkmongAppearLocationService } from './pinkmong-appear-location.service';
import { PinkmongAppearLocation } from 'src/pinkmong-appear-location/entities/pinkmong-appear-location.entity';
import { RegionTheme } from 'src/pinkmong-appear-location/entities/pinkmong-appear-location.entity';

describe('PinkmongAppearLocationService', () => {
  let service: PinkmongAppearLocationService;
  let repository: Partial<{
    findAllForValkey: jest.Mock;
    createLocation: jest.Mock;
    findAll: jest.Mock;
    updateLocation: jest.Mock;
    deleteLocation: jest.Mock;
  }>;
  let valkeyService: Partial<{ set: jest.Mock }>;
  let geoService: Partial<{ geoAddBookmarkP: jest.Mock }>;

  const user_id = 1;

  beforeEach(() => {
    repository = {
      findAllForValkey: jest.fn(),
      createLocation: jest.fn(),
      findAll: jest.fn(),
      updateLocation: jest.fn(),
      deleteLocation: jest.fn(),
    };

    valkeyService = {
      set: jest.fn().mockResolvedValue(undefined),
    };

    geoService = {
      geoAddBookmarkP: jest.fn().mockResolvedValue(undefined),
    };

    service = new PinkmongAppearLocationService(
      repository as any,
      valkeyService as any,
      geoService as any,
    );
  });

  describe('fillValkey', () => {
    it('should throw NotFoundException if no locations found', async () => {
      (repository.findAllForValkey as jest.Mock).mockResolvedValue([]);
      await expect(service.fillValkey()).rejects.toThrow(NotFoundException);
    });

    it('should save each location in geoService and return message', async () => {
      const locations: PinkmongAppearLocation[] = [
        {
          id: 1,
          title: 'Location 1',
          latitude: 10,
          longitude: 20,
          region_theme: 'forest',
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: new Date('2023-01-02T00:00:00Z'),
          deleted_at: new Date('2023-01-03T00:00:00Z'),
          catchPinkmong: [],
        },
        {
          id: 2,
          title: 'Location 2',
          latitude: 30,
          longitude: 40,
          region_theme: 'desert',
          created_at: new Date('2023-02-01T00:00:00Z'),
          updated_at: new Date('2023-02-02T00:00:00Z'),
          deleted_at: new Date('2023-02-03T00:00:00Z'),
          catchPinkmong: [],
        },
      ];
      (repository.findAllForValkey as jest.Mock).mockResolvedValue(locations);

      const result = await service.fillValkey();

      // geoService.geoAddBookmarkP가 각 location마다 호출되었는지 확인
      expect(geoService.geoAddBookmarkP).toHaveBeenCalledTimes(
        locations.length,
      );
      locations.forEach((location) => {
        const expectedData = {
          id: location.id,
          title: location.title,
          latitude: location.latitude,
          longitude: location.longitude,
          region_theme: location.region_theme as RegionTheme,
          created_at: location.created_at.toISOString(),
          updated_at: location.updated_at.toISOString(),
          deleted_at: location.deleted_at.toISOString(),
        };
        expect(geoService.geoAddBookmarkP).toHaveBeenCalledWith(
          'pinkmong-appear-location',
          expectedData,
        );
      });

      expect(result).toEqual({
        message: `✅ ${locations.length}개의 Pinkmong 등장 위치가 Valkey에 저장되었습니다.`,
      });
    });
  });

  describe('createLocation', () => {
    it('should call repository.createLocation and return the created location', async () => {
      const dto = {
        title: 'New Location',
        latitude: 10,
        longitude: 20,
        region_theme: 'ocean',
      };
      const createdLocation: PinkmongAppearLocation = {
        id: 1,
        title: 'New Location',
        latitude: 10,
        longitude: 20,
        region_theme: 'ocean',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null as any,
        catchPinkmong: [],
      };
      (repository.createLocation as jest.Mock).mockResolvedValue(
        createdLocation,
      );
      const result = await service.createLocation(dto);
      expect(repository.createLocation).toHaveBeenCalledWith(dto);
      expect(result).toEqual(createdLocation);
    });
  });

  describe('getAllLocations', () => {
    it('should return all locations from repository.findAll', async () => {
      const locations: PinkmongAppearLocation[] = [
        {
          id: 1,
          title: 'Location 1',
          latitude: 10,
          longitude: 20,
          region_theme: 'city',
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null as any,
          catchPinkmong: [],
        },
      ];
      (repository.findAll as jest.Mock).mockResolvedValue(locations);
      const result = await service.getAllLocations();
      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(locations);
    });
  });

  describe('updateLocation', () => {
    it('should throw NotFoundException if repository.updateLocation returns falsy', async () => {
      (repository.updateLocation as jest.Mock).mockResolvedValue(null);
      const updateDto = {
        title: 'Updated',
        latitude: 50,
        longitude: 60,
        region_theme: 'mountain',
      };
      await expect(service.updateLocation(1, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return updated location when repository.updateLocation returns a location', async () => {
      const updateDto = {
        title: 'Updated',
        latitude: 50,
        longitude: 60,
        region_theme: 'mountain',
      };
      const updatedLocation: PinkmongAppearLocation = {
        id: 1,
        title: 'Updated',
        latitude: 50,
        longitude: 60,
        region_theme: 'mountain',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null as any,
        catchPinkmong: [],
      };
      (repository.updateLocation as jest.Mock).mockResolvedValue(
        updatedLocation,
      );
      const result = await service.updateLocation(1, updateDto);
      expect(repository.updateLocation).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedLocation);
    });
  });

  describe('deleteLocation', () => {
    it('should call repository.deleteLocation and return void', async () => {
      (repository.deleteLocation as jest.Mock).mockResolvedValue(undefined);
      const result = await service.deleteLocation(1);
      expect(repository.deleteLocation).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
