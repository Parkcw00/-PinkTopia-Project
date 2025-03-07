import { Test, TestingModule } from '@nestjs/testing';
import { DirectionController } from './direction.controller';
import { DirectionService } from './direction.service';
import { UserGuard } from '../user/guards/user-guard';

describe('DirectionController', () => {
  let directionController: DirectionController;

  const mockDirectionService = {
    createBookmarks: jest.fn(),
    compareBookmark: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirectionController],
      providers: [
        { provide: DirectionService, useValue: mockDirectionService },
        { provide: UserGuard, useValue: { canActivate: jest.fn(() => true) } },
      ],
    }).compile();

    directionController = module.get<DirectionController>(DirectionController);
  });

  it('should be defined', () => {
    expect(directionController).toBeDefined();
  });

  describe('getAllSubAchievements', () => {
    it('should return all bookmarks', async () => {
      const result = [{ id: '1' }];
      mockDirectionService.createBookmarks.mockResolvedValue(result);

      expect(await directionController.getAllSubAchievements()).toEqual(result);
      expect(mockDirectionService.createBookmarks).toHaveBeenCalled();
    });
  });

  describe('compareBookmark', () => {
    it('should compare bookmark with user direction', async () => {
      const req = { user: { id: 1 } };
      const body = { user_direction: { latitude: 37.0, longitude: 127.0 } };
      const client = {} as any;
      const result = { triggered: true };
      mockDirectionService.compareBookmark.mockResolvedValue(result);

      expect(
        await directionController.compareBookmark(req, body, client),
      ).toEqual(result);
      expect(mockDirectionService.compareBookmark).toHaveBeenCalledWith(
        1,
        37.0,
        127.0,
        client,
      );
    });
  });
});
