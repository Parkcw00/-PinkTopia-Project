import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CatchPinkmongRepository } from './catch_pinkmong.repository';
import { CatchPinkmong } from 'src/catch_pinkmong/entities/catch_pinkmong.entity';
import { User } from 'src/user/entities/user.entity';
import { Pinkmong } from 'src/pinkmong/entities/pinkmong.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Collection } from 'src/collection/entities/collection.entity';
import { Item } from 'src/item/entities/item.entity';

describe('CatchPinkmongRepository', () => {
  let repository: CatchPinkmongRepository;
  let mockCatchRepo: Partial<Record<keyof any, jest.Mock>>;
  let mockUserRepo: Partial<Record<keyof any, jest.Mock>>;
  let mockPinkmongRepo: Partial<Record<keyof any, jest.Mock>>;
  let mockInventoryRepo: Partial<Record<keyof any, jest.Mock>>;
  let mockItemRepo: Partial<Record<keyof any, jest.Mock>>;
  let mockCollectionRepo: Partial<Record<keyof any, jest.Mock>>;

  beforeEach(() => {
    // 각 underlying repository를 위한 mock 객체 생성
    mockCatchRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    mockUserRepo = {
      findOne: jest.fn(),
    };
    mockPinkmongRepo = {
      createQueryBuilder: jest.fn(),
    };
    mockInventoryRepo = {
      findOne: jest.fn(),
    };
    mockItemRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    mockCollectionRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    // 직접 인스턴스를 생성할 때, 생성자에 주입되는 Repository들을 객체로 주입
    repository = new CatchPinkmongRepository(
      // 캐치몽 repository
      mockCatchRepo as any,
      // 유저 repository
      mockUserRepo as any,
      // 핑크몽 repository
      mockPinkmongRepo as any,
      // 인벤토리 repository
      mockInventoryRepo as any,
      // 아이템 repository
      mockItemRepo as any,
      // 도감 repository
      mockCollectionRepo as any,
    );
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      const fakeUser: User = { id: 1 } as User;
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(fakeUser);
      const result = await repository.getUser(1);
      expect(result).toEqual(fakeUser);
      expect(mockUserRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when user not found', async () => {
      (mockUserRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(repository.getUser(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getInventoryByUser', () => {
    it('should return inventory when found', async () => {
      const fakeUser: User = { id: 1 } as User;
      const fakeInventory: Inventory = {
        id: 10,
        user_id: fakeUser.id,
      } as Inventory;
      (mockInventoryRepo.findOne as jest.Mock).mockResolvedValue(fakeInventory);
      const result = await repository.getInventoryByUser(fakeUser);
      expect(result).toEqual(fakeInventory);
      expect(mockInventoryRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: fakeUser.id },
      });
    });

    it('should throw NotFoundException when inventory not found', async () => {
      const fakeUser: User = { id: 1 } as User;
      (mockInventoryRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(repository.getInventoryByUser(fakeUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getExistingCatchByInventory', () => {
    it('should return existing catch or null', async () => {
      const fakeCatch: CatchPinkmong = { id: 100 } as CatchPinkmong;
      (mockCatchRepo.findOne as jest.Mock).mockResolvedValue(fakeCatch);
      const result = await repository.getExistingCatchByInventory(10);
      expect(result).toEqual(fakeCatch);
      expect(mockCatchRepo.findOne).toHaveBeenCalledWith({
        where: { inventory_id: 10 },
      });
    });
  });

  describe('getRandomRegionByGrade', () => {
    let mockQueryBuilder: any;
    beforeEach(() => {
      mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
      };
      (mockPinkmongRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );
    });

    it('should return region if result found', async () => {
      const fakeResult = { region: 'test_region' };
      mockQueryBuilder.getRawOne.mockResolvedValue(fakeResult);
      const result = await repository.getRandomRegionByGrade('legendary');
      expect(result).toEqual('test_region');
      expect(mockPinkmongRepo.createQueryBuilder).toHaveBeenCalledWith('p');
    });

    it('should throw NotFoundException if no region found', async () => {
      mockQueryBuilder.getRawOne.mockResolvedValue(null);
      await expect(
        repository.getRandomRegionByGrade('legendary'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRandomPinkmongByGradeAndRegion', () => {
    let mockQueryBuilder: any;
    beforeEach(() => {
      mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      };
      (mockPinkmongRepo.createQueryBuilder as jest.Mock).mockReturnValue(
        mockQueryBuilder,
      );
    });

    it('should return pinkmong if found', async () => {
      const fakePinkmong: Pinkmong = { id: 200 } as Pinkmong;
      mockQueryBuilder.getOne.mockResolvedValue(fakePinkmong);
      const result = await repository.getRandomPinkmongByGradeAndRegion(
        'rare',
        'test_region',
      );
      expect(result).toEqual(fakePinkmong);
    });

    it('should throw NotFoundException if pinkmong not found', async () => {
      mockQueryBuilder.getOne.mockResolvedValue(null);
      await expect(
        repository.getRandomPinkmongByGradeAndRegion('rare', 'test_region'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getExistingCatch', () => {
    it('should return an existing catch if found', async () => {
      const fakeCatch: CatchPinkmong = { id: 300 } as CatchPinkmong;
      (mockCatchRepo.findOne as jest.Mock).mockResolvedValue(fakeCatch);
      const result = await repository.getExistingCatch(1, 200, 10);
      expect(result).toEqual(fakeCatch);
      expect(mockCatchRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: 1, pinkmong_id: 200, inventory_id: 10 },
      });
    });
  });

  describe('createCatchPinkmong', () => {
    it('should create and save a new catchPinkmong', async () => {
      const fakeUser: User = { id: 1 } as User;
      const fakeInventory: Inventory = {
        id: 10,
        user_id: fakeUser.id,
      } as Inventory;
      const fakePinkmong: Pinkmong = { id: 200 } as Pinkmong;
      const fakeCatch: CatchPinkmong = { id: 400 } as CatchPinkmong;

      (mockCatchRepo.create as jest.Mock).mockReturnValue(fakeCatch);
      (mockCatchRepo.save as jest.Mock).mockResolvedValue(fakeCatch);

      const result = await repository.createCatchPinkmong(
        fakeUser,
        fakeInventory,
        fakePinkmong,
      );
      expect(mockCatchRepo.create).toHaveBeenCalledWith({
        user: fakeUser,
        user_id: fakeUser.id,
        pinkmong_id: fakePinkmong.id,
        inventory: fakeInventory,
        inventory_id: fakeInventory.id,
      });
      expect(result).toEqual(fakeCatch);
    });
  });

  describe('removeCatchPinkmong', () => {
    it('should remove the catchPinkmong record', async () => {
      const fakeCatch: CatchPinkmong = { id: 500 } as CatchPinkmong;
      await repository.removeCatchPinkmong(fakeCatch);
      expect(mockCatchRepo.remove).toHaveBeenCalledWith(fakeCatch);
    });
  });

  describe('getCatchRecordByUser', () => {
    it('should return catch record when found', async () => {
      const fakeCatch: CatchPinkmong = { id: 600 } as CatchPinkmong;
      (mockCatchRepo.findOne as jest.Mock).mockResolvedValue(fakeCatch);
      const result = await repository.getCatchRecordByUser(1, ['pinkmong']);
      expect(result).toEqual(fakeCatch);
      expect(mockCatchRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: 1 },
        relations: ['pinkmong'],
      });
    });

    it('should throw NotFoundException when catch record not found', async () => {
      (mockCatchRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        repository.getCatchRecordByUser(1, ['pinkmong']),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getItemById', () => {
    it('should return item when found', async () => {
      const fakeItem: Item = { id: 700 } as Item;
      (mockItemRepo.findOne as jest.Mock).mockResolvedValue(fakeItem);
      const result = await repository.getItemById(700);
      expect(result).toEqual(fakeItem);
      expect(mockItemRepo.findOne).toHaveBeenCalledWith({
        where: { id: 700 },
        relations: ['inventory'],
      });
    });

    it('should throw NotFoundException when item not found', async () => {
      (mockItemRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(repository.getItemById(700)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateItem', () => {
    it('should save and return the updated item', async () => {
      const fakeItem: Item = { id: 800 } as Item;
      (mockItemRepo.save as jest.Mock).mockResolvedValue(fakeItem);
      const result = await repository.updateItem(fakeItem);
      expect(result).toEqual(fakeItem);
      expect(mockItemRepo.save).toHaveBeenCalledWith(fakeItem);
    });
  });

  describe('getCollection', () => {
    it('should return collection if exists', async () => {
      const fakeCollection: Collection = {} as Collection;
      (mockCollectionRepo.findOne as jest.Mock).mockResolvedValue(
        fakeCollection,
      );
      const result = await repository.getCollection(1, 200);
      expect(result).toEqual(fakeCollection);
      expect(mockCollectionRepo.findOne).toHaveBeenCalledWith({
        where: { user_id: 1, pinkmong_id: 200 },
      });
    });
  });

  describe('createCollection', () => {
    it('should create and save a new collection', async () => {
      const fakeUser: User = { id: 1 } as User;
      const fakePinkmong: Pinkmong = { id: 200 } as Pinkmong;
      const fakeCollection: Collection = {} as Collection;
      (mockCollectionRepo.create as jest.Mock).mockReturnValue(fakeCollection);
      (mockCollectionRepo.save as jest.Mock).mockResolvedValue(fakeCollection);

      const result = await repository.createCollection(fakeUser, fakePinkmong);
      expect(mockCollectionRepo.create).toHaveBeenCalledWith({
        user: fakeUser,
        user_id: fakeUser.id,
        pinkmong: fakePinkmong,
        pinkmong_id: fakePinkmong.id,
      });
      expect(result).toEqual(fakeCollection);
    });
  });
});
