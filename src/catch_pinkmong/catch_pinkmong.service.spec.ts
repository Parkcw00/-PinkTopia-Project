import { Test, TestingModule } from '@nestjs/testing';
import { CatchPinkmongService } from './catch_pinkmong.service';
import { CatchPinkmongRepository } from './catch_pinkmong.repository';

describe('CatchPinkmongService', () => {
  let service: CatchPinkmongService;
  let repository: CatchPinkmongRepository;

  const mockCatchPinkmongRepository = {
    getUser: jest.fn((userId) => ({ id: userId, name: 'TestUser' })),
    getExistingCatchByInventory: jest.fn((inventoryId) => ({
      id: 1,
      inventory_id: inventoryId,
    })),
    updateItem: jest.fn((item) => ({ ...item, updated: true })),
    removeCatchPinkmong: jest.fn((catchRecord) => ({
      success: true,
      id: catchRecord.id,
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatchPinkmongService,
        {
          provide: CatchPinkmongRepository,
          useValue: mockCatchPinkmongRepository,
        },
      ],
    }).compile();

    service = module.get<CatchPinkmongService>(CatchPinkmongService);
    repository = module.get<CatchPinkmongRepository>(CatchPinkmongRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should trigger appearPinkmong', async () => {
    const userId = 1;
    expect(await service.appearPinkmong(userId)).toEqual({
      success: true,
      userId,
    });
    expect(repository.getUser).toHaveBeenCalledWith(userId);
  });

  it('should trigger feeding', async () => {
    const userId = 1;
    const itemId = 5;
    expect(await service.feeding(userId, itemId)).toEqual({
      success: true,
      userId,
      itemId,
    });
    expect(repository.updateItem).toHaveBeenCalledWith(userId, itemId);
  });

  it('should trigger giveUp', async () => {
    const userId = 1;
    expect(await service.giveup(userId)).toEqual({ success: true, userId });
    expect(repository.removeCatchPinkmong).toHaveBeenCalledWith(userId);
  });
});
