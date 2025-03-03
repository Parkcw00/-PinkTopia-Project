import { Test, TestingModule } from '@nestjs/testing';
import { StoreItemController } from './store-item.controller';
import { StoreItemService } from './store-item.service';
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';

// 엔티티 모킹
jest.mock('./entities/store-item.entity', () => ({
  StoreItem: class MockStoreItem {}
}));

// S3Service 모킹
jest.mock('../s3/s3.service', () => ({
  S3Service: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue('mocked-image-url.jpg'),
  }))
}));

// ValkeyService 모킹
jest.mock('../valkey/valkey.service', () => ({
  ValkeyService: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
  }))
}));

// 가드 모킹
jest.mock('../user/guards/user-guard', () => ({
  UserGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true)
  }))
}));

jest.mock('../user/guards/admin.guard', () => ({
  AdminGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true)
  }))
}));

describe('StoreItemController', () => {
  let controller: StoreItemController;
  let service: StoreItemService;

  const mockStoreItemService = {
    addShopItem: jest.fn(),
    findAll: jest.fn(),
    storeItemFindOne: jest.fn(),
    updateStoreItem: jest.fn(),
    deleteStoreItem: jest.fn(),
  };

  const mockStoreItem = {
    id: 1,
    name: '테스트 아이템',
    item_image: 'test.jpg',
    potion: false,
    potion_time: 0,
    gem_price: 100,
    dia_price: 50,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreItemController],
      providers: [
        {
          provide: StoreItemService,
          useValue: mockStoreItemService,
        }
      ],
    })
    .overrideGuard(UserGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(AdminGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<StoreItemController>(StoreItemController);
    service = module.get<StoreItemService>(StoreItemService);
  });

  it('컨트롤러가 정의되어 있어야 합니다', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('상점 아이템을 생성해야 합니다', async () => {
      const mockReq = { user: { id: 1 } };
      const mockCreateDto = {
        name: '테스트 아이템',
        potion: false,
        potion_time: 0,
        gem_price: 100,
        dia_price: 50,
      };
      const mockFile = { filename: 'test.jpg' } as Express.Multer.File;

      mockStoreItemService.addShopItem.mockResolvedValue(mockStoreItem);

      const result = await controller.create(mockReq, mockCreateDto, mockFile);

      expect(service.addShopItem).toHaveBeenCalledWith(
        mockReq.user,
        mockCreateDto,
        mockFile,
      );
      expect(result).toEqual(mockStoreItem);
    });
  });

  describe('findAll', () => {
    it('모든 상점 아이템을 조회해야 합니다', async () => {
      const expectedItems = [mockStoreItem];
      mockStoreItemService.findAll.mockResolvedValue(expectedItems);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedItems);
    });
  });

  describe('findOne', () => {
    it('특정 상점 아이템을 조회해야 합니다', async () => {
      const itemId = 1;
      mockStoreItemService.storeItemFindOne.mockResolvedValue(mockStoreItem);

      const result = await controller.findOne(itemId);

      expect(service.storeItemFindOne).toHaveBeenCalledWith(itemId);
      expect(result).toEqual(mockStoreItem);
    });
  });

  describe('update', () => {
    it('상점 아이템을 수정해야 합니다', async () => {
      const mockReq = { user: { id: 1 } };
      const itemId = 1;
      const mockUpdateDto = {
        name: '수정된 아이템',
        potion: true,
        potion_time: 30,
        gem_price: 150,
        dia_price: 75,
      };
      const mockFile = { filename: 'updated.jpg' } as Express.Multer.File;

      const updatedItem = { ...mockStoreItem, ...mockUpdateDto };
      mockStoreItemService.updateStoreItem.mockResolvedValue(updatedItem);

      const result = await controller.update(mockReq, itemId, mockUpdateDto, mockFile);

      expect(service.updateStoreItem).toHaveBeenCalledWith(
        mockReq.user,
        itemId,
        mockUpdateDto,
        mockFile,
      );
      expect(result).toEqual(updatedItem);
    });
  });

  describe('delete', () => {
    it('상점 아이템을 삭제해야 합니다', async () => {
      const mockReq = { user: { id: 1 } };
      const itemId = 1;
      const expectedResult = { success: true };

      mockStoreItemService.deleteStoreItem.mockResolvedValue(expectedResult);

      const result = await controller.delete(mockReq, itemId);

      expect(service.deleteStoreItem).toHaveBeenCalledWith(
        mockReq.user,
        itemId
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
