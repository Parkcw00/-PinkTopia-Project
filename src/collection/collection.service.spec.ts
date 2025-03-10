import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CollectionService } from './collection.service';
import { Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { User } from 'src/user/entities/user.entity';
import { Pinkmong } from 'src/pinkmong/entities/pinkmong.entity';

describe('CollectionService', () => {
  let service: CollectionService;
  let collectionRepo: Partial<Repository<Collection>>;
  let userRepo: Partial<Repository<User>>;
  let pinkmongRepo: Partial<Repository<Pinkmong>>;

  beforeEach(() => {
    collectionRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    userRepo = {
      findOne: jest.fn(),
    };

    pinkmongRepo = {
      find: jest.fn(),
    };

    service = new CollectionService(
      collectionRepo as Repository<Collection>,
      userRepo as Repository<User>,
      pinkmongRepo as Repository<Pinkmong>,
    );
  });

  describe('findCollectionsByUser', () => {
    it('should throw NotFoundException if user not found', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findCollectionsByUser(1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return pinkmong array from collections for the user', async () => {
      const fakeUser: User = { id: 1 } as User;
      const fakePinkmong1: Pinkmong = {
        id: 100,
        name: '핑크몽A',
        pinkmong_image: 'a.png',
        grade: 'common',
        region_theme: 'regionA',
        explain: '설명A',
      } as Pinkmong;
      const fakePinkmong2: Pinkmong = {
        id: 200,
        name: '핑크몽B',
        pinkmong_image: 'b.png',
        grade: 'rare',
        region_theme: 'regionB',
        explain: '설명B',
      } as Pinkmong;
      const fakeCollections: Collection[] = [
        { id: 1, user_id: 1, pinkmong: fakePinkmong1 } as Collection,
        { id: 2, user_id: 1, pinkmong: fakePinkmong2 } as Collection,
      ];

      (userRepo.findOne as jest.Mock).mockResolvedValue(fakeUser);
      (collectionRepo.find as jest.Mock).mockResolvedValue(fakeCollections);

      const result = await service.findCollectionsByUser(1);
      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(collectionRepo.find).toHaveBeenCalledWith({
        where: { user_id: 1 },
        relations: ['pinkmong'],
      });
      expect(result).toEqual([fakePinkmong1, fakePinkmong2]);
    });
  });

  describe('deleteCollection', () => {
    it('should throw NotFoundException if collection not found', async () => {
      (collectionRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.deleteCollection(123)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should remove collection and return success message', async () => {
      const fakeCollection: Collection = { id: 123 } as Collection;
      (collectionRepo.findOne as jest.Mock).mockResolvedValue(fakeCollection);
      (collectionRepo.remove as jest.Mock).mockResolvedValue(fakeCollection);

      const result = await service.deleteCollection(123);
      expect(collectionRepo.findOne).toHaveBeenCalledWith({
        where: { id: 123 },
      });
      expect(collectionRepo.remove).toHaveBeenCalledWith(fakeCollection);
      expect(result).toEqual({ message: '도감 기록이 삭제되었습니다.' });
    });
  });

  describe('getCollectionStatus', () => {
    it('should return mapped collection status with proper collected flags', async () => {
      // 1. 모든 핑크몽 데이터 조회
      const allPinkmongs: Pinkmong[] = [
        {
          id: 1,
          name: '핑크몽A',
          pinkmong_image: 'a.png',
          grade: 'common',
          region_theme: 'regionA',
          explain: '설명A',
        } as Pinkmong,
        {
          id: 2,
          name: '핑크몽B',
          pinkmong_image: 'b.png',
          grade: 'rare',
          region_theme: 'regionB',
          explain: '설명B',
        } as Pinkmong,
      ];
      (pinkmongRepo.find as jest.Mock).mockResolvedValue(allPinkmongs);

      // 2. 유저가 수집한 핑크몽 조회 (1번만 수집했다고 가정)
      const userCollections = [
        {
          id: 10,
          user_id: 1,
          pinkmong: allPinkmongs[0],
          pinkmong_id: 1,
        } as Collection,
      ];
      (collectionRepo.find as jest.Mock).mockResolvedValue(userCollections);

      const result = await service.getCollectionStatus(1);

      // 3. 매핑 검증
      const expectedStatus = [
        {
          id: 1,
          name: allPinkmongs[0].name,
          pinkmong_image: allPinkmongs[0].pinkmong_image,
          grade: allPinkmongs[0].grade,
          region_theme: allPinkmongs[0].region_theme,
          explain: allPinkmongs[0].explain,
          isCollected: true,
        },
        {
          id: 2,
          name: '???',
          pinkmong_image: '/images/unknown.png',
          grade: '???',
          region_theme: '???',
          explain: '아직 발견하지 못한 핑크몽입니다.',
          isCollected: false,
        },
      ];

      expect(pinkmongRepo.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
      expect(collectionRepo.find).toHaveBeenCalledWith({
        where: { user_id: 1 },
        relations: ['pinkmong'],
      });
      expect(result).toEqual({ data: expectedStatus });
    });
  });
});
