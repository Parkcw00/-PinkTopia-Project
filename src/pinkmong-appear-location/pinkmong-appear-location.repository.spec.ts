import { IsNull } from 'typeorm';
import { PinkmongAppearLocationRepository } from './pinkmong-appear-location.repository';
import {
  PinkmongAppearLocation,
  RegionTheme,
} from 'src/pinkmong-appear-location/entities/pinkmong-appear-location.entity';

describe('PinkmongAppearLocationRepository', () => {
  let repository: PinkmongAppearLocationRepository;
  let repo: Partial<{
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
    delete: jest.Mock;
  }>;

  beforeEach(() => {
    repo = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    repository = new PinkmongAppearLocationRepository(repo as any);
  });

  describe('findAllForValkey', () => {
    it('should call repo.find with where deleted_at IsNull and return results', async () => {
      const fakeLocations: PinkmongAppearLocation[] = [
        {
          id: 1,
          title: 'Location 1',
          latitude: 1.2345678,
          longitude: 2.3456789,
          region_theme: RegionTheme.FOREST,
          created_at: new Date('2023-01-01T00:00:00Z'),
          updated_at: new Date('2023-01-02T00:00:00Z'),
          deleted_at: null as any,
          catchPinkmong: [],
        },
        {
          id: 2,
          title: 'Location 2',
          latitude: 3.456789,
          longitude: 4.5678901,
          region_theme: RegionTheme.DESERT,
          created_at: new Date('2023-02-01T00:00:00Z'),
          updated_at: new Date('2023-02-02T00:00:00Z'),
          deleted_at: null as any,
          catchPinkmong: [],
        },
      ];
      (repo.find as jest.Mock).mockResolvedValue(fakeLocations);

      const result = await repository.findAllForValkey();

      expect(repo.find).toHaveBeenCalledWith({
        where: { deleted_at: IsNull() },
      });
      expect(result).toEqual(fakeLocations);
    });
  });

  describe('createLocation', () => {
    it('should create a new location and save it', async () => {
      const createDto = {
        title: 'Test Location',
        latitude: 10.0,
        longitude: 20.0,
        region_theme: RegionTheme.OCEAN,
      };
      const newLocation = { ...createDto };
      const savedLocation: PinkmongAppearLocation = {
        id: 1,
        title: 'Test Location',
        latitude: 10.0,
        longitude: 20.0,
        region_theme: RegionTheme.OCEAN,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null as any,
        catchPinkmong: [],
      };

      (repo.create as jest.Mock).mockReturnValue(newLocation);
      (repo.save as jest.Mock).mockResolvedValue(savedLocation);

      const result = await repository.createLocation(createDto);
      expect(repo.create).toHaveBeenCalledWith(createDto);
      expect(repo.save).toHaveBeenCalledWith(newLocation);
      expect(result).toEqual(savedLocation);
    });
  });

  describe('findAll', () => {
    it('should return all locations using repo.find', async () => {
      const fakeLocations: PinkmongAppearLocation[] = [
        {
          id: 1,
          title: 'Location 1',
          latitude: 10.0,
          longitude: 20.0,
          region_theme: RegionTheme.CITY,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null as any,
          catchPinkmong: [],
        },
      ];
      (repo.find as jest.Mock).mockResolvedValue(fakeLocations);

      const result = await repository.findAll();
      expect(repo.find).toHaveBeenCalled();
      expect(result).toEqual(fakeLocations);
    });
  });

  describe('findById', () => {
    it('should call repo.findOne with correct id and return the location', async () => {
      const fakeLocation: PinkmongAppearLocation = {
        id: 1,
        title: 'Location 1',
        latitude: 10.0,
        longitude: 20.0,
        region_theme: RegionTheme.MOUNTAIN,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null as any,
        catchPinkmong: [],
      };
      (repo.findOne as jest.Mock).mockResolvedValue(fakeLocation);

      const result = await repository.findById(1);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(fakeLocation);
    });
  });

  describe('deleteLocation', () => {
    it('should call repo.delete with given id', async () => {
      (repo.delete as jest.Mock).mockResolvedValue(undefined);
      await repository.deleteLocation(1);
      expect(repo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('updateLocation', () => {
    it('should update a location if it exists', async () => {
      const updateDto = {
        title: 'Updated Title',
        latitude: 5.0,
        longitude: 10.0,
        region_theme: RegionTheme.CITY,
      };
      const existingLocation: PinkmongAppearLocation = {
        id: 1,
        title: 'Old Title',
        latitude: 1.0,
        longitude: 2.0,
        region_theme: RegionTheme.FOREST,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null as any,
        catchPinkmong: [],
      };
      const updatedLocation: PinkmongAppearLocation = {
        ...existingLocation,
        ...updateDto,
      };

      (repo.findOne as jest.Mock).mockResolvedValue(existingLocation);
      (repo.save as jest.Mock).mockResolvedValue(updatedLocation);

      const result = await repository.updateLocation(1, updateDto);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repo.save).toHaveBeenCalledWith(updatedLocation);
      expect(result).toEqual(updatedLocation);
    });

    it('should return null if location does not exist', async () => {
      const updateDto = {
        title: 'Updated Title',
        latitude: 5.0,
        longitude: 10.0,
        region_theme: RegionTheme.CITY,
      };
      (repo.findOne as jest.Mock).mockResolvedValue(null);
      const result = await repository.updateLocation(1, updateDto);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBeNull();
    });
  });
});
