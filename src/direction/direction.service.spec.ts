import { Test, TestingModule } from '@nestjs/testing';
import { DirectionService } from './direction.service';
import { ValkeyService } from '../valkey/valkey.service';
import { GeoService } from '../geo/geo.service';
import { AchievementPService } from '../achievement-p/achievement-p.service';
import { DirectionGateway } from './direction.gateway';

describe('DirectionService', () => {
  let directionService: DirectionService;

  const mockGeoService = {
    getGeoData: jest.fn(),
    getHashData: jest.fn(),
    getNearbyBookmarksS: jest.fn(),
    getNearbyBookmarkP: jest.fn(),
  };

  const mockValkeyService = {
    get: jest.fn(),
  };

  const mockAPService = {
    post: jest.fn(),
  };

  const mockDirectionGateway = {
    sendPopup: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DirectionService,
        { provide: ValkeyService, useValue: mockValkeyService },
        { provide: GeoService, useValue: mockGeoService },
        { provide: AchievementPService, useValue: mockAPService },
        { provide: DirectionGateway, useValue: mockDirectionGateway },
      ],
    }).compile();

    directionService = module.get<DirectionService>(DirectionService);
  });

  it('should be defined', () => {
    expect(directionService).toBeDefined();
  });

  describe('createBookmarks', () => {
    it('should create bookmarks from geo data', async () => {
      mockGeoService.getGeoData.mockResolvedValue({ data: [], members: ['1'] });
      mockGeoService.getHashData.mockResolvedValue([
        { id: '1', title: 'Test' },
      ]);

      const result = await directionService.createBookmarks();
      expect(result).toEqual([
        { id: '1', title: 'Test' },
        { id: '1', title: 'Test' },
      ]);
      expect(mockGeoService.getGeoData).toHaveBeenCalledWith('sub-achievement');
      expect(mockGeoService.getGeoData).toHaveBeenCalledWith(
        'pinkmong-appear-location',
      );
    });
  });

  describe('compareBookmark', () => {
    it('should handle nearby sub-achievements', async () => {
      const client = {} as any;
      mockGeoService.getNearbyBookmarksS.mockResolvedValue([
        { id: '1', title: 'Test' },
      ]);
      mockAPService.post.mockResolvedValue(undefined);

      await directionService.compareBookmark(1, 37.0, 127.0, client);
      expect(mockGeoService.getNearbyBookmarksS).toHaveBeenCalledWith(
        37.0,
        127.0,
      );
      expect(mockAPService.post).toHaveBeenCalledWith(1, '1');
    });

    it('should handle nearby pinkmong and send popup', async () => {
      const client = {} as any;
      mockGeoService.getNearbyBookmarkP.mockResolvedValue({
        id: '1',
        title: 'Pinkmong',
      });

      const result = await directionService.compareBookmark(
        1,
        37.0,
        127.0,
        client,
      );
      expect(result).toEqual({
        triggered: true,
        bookmark: { id: '1', title: 'Pinkmong' },
      });
      expect(mockDirectionGateway.sendPopup).toHaveBeenCalled();
    });
  });
});
