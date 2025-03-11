import { Test, TestingModule } from '@nestjs/testing';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';

describe('CollectionController', () => {
  let controller: CollectionController;
  let service: CollectionService;

  const fakeUser = { id: 1 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [
        {
          provide: CollectionService,
          useValue: {
            findCollectionsByUser: jest.fn(),
            getCollectionStatus: jest.fn(),
            deleteCollection: jest.fn(),
          },
        },
      ],
    })
      // override UserGuard to always return true
      .overrideGuard(UserGuard)
      .useValue({ canActivate: () => true })
      // AdminGuard가 필요하다면 같이 override (현재 사용되지 않더라도)
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CollectionController>(CollectionController);
    service = module.get<CollectionService>(CollectionService);
  });

  describe('findAll', () => {
    it('should return collections for the authenticated user', async () => {
      const fakeCollections = [{ id: 1, name: 'Test Collection' }];
      (service.findCollectionsByUser as jest.Mock).mockResolvedValue(
        fakeCollections,
      );
      const req = { user: fakeUser };

      const result = await controller.findAll(req);

      expect(service.findCollectionsByUser).toHaveBeenCalledWith(fakeUser.id);
      expect(result).toEqual(fakeCollections);
    });
  });

  describe('getCollectionStatus', () => {
    it('should return collection status for the authenticated user', async () => {
      const fakeStatus = { count: 5, completed: true };
      (service.getCollectionStatus as jest.Mock).mockResolvedValue(fakeStatus);
      const req = { user: fakeUser };

      const result = await controller.getCollectionStatus(req);

      expect(service.getCollectionStatus).toHaveBeenCalledWith(fakeUser.id);
      expect(result).toEqual(fakeStatus);
    });
  });

  describe('remove', () => {
    it('should call deleteCollection with correct collectionId and return the result', async () => {
      const fakeResult = { success: true };
      (service.deleteCollection as jest.Mock).mockResolvedValue(fakeResult);

      const collectionId = '123';
      const result = await controller.remove(collectionId);

      expect(service.deleteCollection).toHaveBeenCalledWith(
        Number(collectionId),
      );
      expect(result).toEqual(fakeResult);
    });
  });
});
