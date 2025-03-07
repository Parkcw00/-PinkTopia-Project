import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CatchPinkmongService } from './catch_pinkmong.service';
import { CatchPinkmongRepository } from './catch_pinkmong.repository';
import { ValkeyService } from 'src/valkey/valkey.service';

describe('CatchPinkmongService', () => {
  let service: CatchPinkmongService;
  let repo: Partial<Record<keyof CatchPinkmongRepository, jest.Mock>>;
  let valkeyService: Partial<Record<keyof ValkeyService, jest.Mock>>;

  const fakeUser = { id: 1, name: '테스트유저' };
  const fakeInventory = { id: 10, userId: fakeUser.id };
  const fakePinkmong = {
    id: 100,
    name: '핑크몽테스트',
    pinkmong_image: 'image_url',
  };

  beforeEach(() => {
    repo = {
      getUser: jest.fn().mockResolvedValue(fakeUser),
      getInventoryByUser: jest.fn().mockResolvedValue(fakeInventory),
      getExistingCatchByInventory: jest.fn().mockResolvedValue(null),
      getRandomRegionByGrade: jest.fn().mockResolvedValue('some_region'),
      getRandomPinkmongByGradeAndRegion: jest
        .fn()
        .mockResolvedValue(fakePinkmong),
      getExistingCatch: jest.fn().mockResolvedValue(null),
      createCatchPinkmong: jest.fn().mockImplementation(async () => {
        return {
          id: 999,
          user: fakeUser,
          pinkmong: fakePinkmong,
          inventory: fakeInventory,
        };
      }),
      getCatchRecordByUser: jest.fn(),
      getItemById: jest.fn(),
      updateItem: jest.fn().mockResolvedValue(true),
      removeCatchPinkmong: jest.fn().mockResolvedValue(true),
      getCollection: jest.fn().mockResolvedValue(null),
      createCollection: jest.fn().mockResolvedValue(true),
    };

    valkeyService = {
      set: jest.fn().mockResolvedValue(true),
      get: jest.fn().mockResolvedValue([]),
      del: jest.fn().mockResolvedValue(true),
    };

    service = new CatchPinkmongService(
      repo as unknown as CatchPinkmongRepository,
      valkeyService as unknown as ValkeyService,
    );
  });

  describe('appearPinkmong', () => {
    it('should return early if 이미 다른 핑크몽이 등장 중인 경우', async () => {
      // 기존에 등장중인 catch가 존재하는 경우
      (repo.getExistingCatchByInventory as jest.Mock).mockResolvedValue({
        id: 123,
      });
      const result = await service.appearPinkmong(fakeUser.id);
      expect(result.message).toMatch(/이미 다른 핑크몽이 등장 중입니다!/);
    });

    it('should create a new catchPinkmong and return pinkmong image and message', async () => {
      // Math.random 을 조작하여 등급 결정 (예: 0.02 -> legendary)
      jest.spyOn(Math, 'random').mockReturnValue(0.02);
      const result = await service.appearPinkmong(fakeUser.id);
      expect(repo.getUser).toHaveBeenCalledWith(fakeUser.id);
      expect(repo.getInventoryByUser).toHaveBeenCalledWith(fakeUser);
      expect(repo.getRandomRegionByGrade).toHaveBeenCalledWith('legendary');
      expect(repo.getRandomPinkmongByGradeAndRegion).toHaveBeenCalledWith(
        'legendary',
        'some_region',
      );
      expect(repo.createCatchPinkmong).toHaveBeenCalled();
      expect(valkeyService.set).toHaveBeenCalled();
      expect(result).toHaveProperty(
        'pinkmongImage',
        fakePinkmong.pinkmong_image,
      );
      expect(result.message).toContain('(등급: legendary)');
    });
  });

  describe('feeding', () => {
    let fakeCatchRecord: any;
    let fakeItem: any;
    beforeEach(() => {
      fakeCatchRecord = {
        id: 500,
        user: fakeUser,
        pinkmong: fakePinkmong,
        inventory: fakeInventory,
      };
      fakeItem = {
        id: 1,
        count: 3,
        inventory: fakeInventory,
      };
      (repo.getCatchRecordByUser as jest.Mock).mockResolvedValue(
        fakeCatchRecord,
      );
      (repo.getItemById as jest.Mock).mockResolvedValue(fakeItem);
    });

    it('should throw NotFoundException if inventory is missing', async () => {
      (repo.getCatchRecordByUser as jest.Mock).mockResolvedValue({
        ...fakeCatchRecord,
        inventory: null,
      });
      await expect(service.feeding(fakeUser.id, fakeItem.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if item does not belong to user inventory', async () => {
      // item.inventory.id와 fakeInventory.id가 다를 경우
      (repo.getItemById as jest.Mock).mockResolvedValue({
        ...fakeItem,
        inventory: { id: 999 },
      });
      await expect(service.feeding(fakeUser.id, fakeItem.id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should process feeding failure without reaching max attempts', async () => {
      // feeding 실패: Math.random() > finalCatchRate (finalCatchRate 기본 0.1, bonus=0)
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      // 초기 시도 횟수 0
      service['catchAttempts'].set(fakeCatchRecord.id, 0);

      const result = await service.feeding(fakeUser.id, fakeItem.id);
      expect(result.success).toBe(false);
      expect(result.message).toContain('핑크몽 포획 실패!');
      // 횟수가 증가했음을 검증
      expect(service['catchAttempts'].get(fakeCatchRecord.id)).toBe(1);
    });

    it('should process feeding failure and remove catch after 5 attempts', async () => {
      jest.spyOn(Math, 'random').mockReturnValue(0.5);
      // simulate 4 previous failures
      service['catchAttempts'].set(fakeCatchRecord.id, 4);

      const result = await service.feeding(fakeUser.id, fakeItem.id);
      expect(repo.removeCatchPinkmong).toHaveBeenCalledWith(fakeCatchRecord);
      expect(valkeyService.del).toHaveBeenCalledWith(
        `pinkmong_battle:${fakeUser.id}`,
      );
      expect(result.message).toBe('핑크몽이 도망갔습니다!');
      expect(result.success).toBe(false);
      // catchAttempts should be deleted
      expect(service['catchAttempts'].has(fakeCatchRecord.id)).toBe(false);
    });

    it('should process feeding success when capture is successful and not in collection', async () => {
      // feeding 성공: Math.random() <= finalCatchRate (finalCatchRate = 0.1 기본)
      jest.spyOn(Math, 'random').mockReturnValue(0.05);
      // getCollection returns null => 최초 포획
      (repo.getCollection as jest.Mock).mockResolvedValue(null);

      const result = await service.feeding(fakeUser.id, fakeItem.id);
      expect(repo.removeCatchPinkmong).toHaveBeenCalledWith(fakeCatchRecord);
      expect(valkeyService.del).toHaveBeenCalledWith(
        `pinkmong_battle:${fakeUser.id}`,
      );
      expect(repo.createCollection).toHaveBeenCalledWith(
        fakeUser,
        fakePinkmong,
      );
      expect(result.message).toContain('최초 포획으로 도감에 등록되었습니다!');
      expect(result.success).toBe(true);
    });

    it('should process feeding success when capture is successful and already in collection', async () => {
      // feeding 성공: Math.random() <= finalCatchRate (finalCatchRate = 0.1 기본)
      jest.spyOn(Math, 'random').mockReturnValue(0.05);
      // getCollection returns existing collection
      (repo.getCollection as jest.Mock).mockResolvedValue({ id: 777 });

      const result = await service.feeding(fakeUser.id, fakeItem.id);
      expect(repo.removeCatchPinkmong).toHaveBeenCalledWith(fakeCatchRecord);
      expect(valkeyService.del).toHaveBeenCalledWith(
        `pinkmong_battle:${fakeUser.id}`,
      );
      expect(repo.createCollection).not.toHaveBeenCalled();
      expect(result.message).toContain('을(를) 잡았습니다!');
      expect(result.success).toBe(true);
    });

    it('should decrease item count and update inventory items in Valkey', async () => {
      // 기본 성공 또는 실패 여부와 관계없이 아이템 사용 로직 검증
      jest.spyOn(Math, 'random').mockReturnValue(0.5); // feeding 실패 scenario
      // valkeyService.get returns some existing items
      const fakeItems = [{ id: fakeItem.id, count: fakeItem.count }];
      (valkeyService.get as jest.Mock).mockResolvedValue(fakeItems);

      await service.feeding(fakeUser.id, fakeItem.id);
      expect(repo.updateItem).toHaveBeenCalled();
      // updateItem should be called after decrementing count
      expect(fakeItem.count).toBe(2);
      expect(valkeyService.set).toHaveBeenCalledWith(
        `invenItems:${fakeUser.id}`,
        [{ id: fakeItem.id, count: 2 }],
        3600,
      );
    });
  });

  describe('giveup', () => {
    let fakeCatchRecord: any;
    beforeEach(() => {
      fakeCatchRecord = {
        id: 700,
        pinkmong: fakePinkmong,
      };
      (repo.getCatchRecordByUser as jest.Mock).mockResolvedValue(
        fakeCatchRecord,
      );
      // set an arbitrary attempt count so we can verify deletion
      service['catchAttempts'].set(fakeCatchRecord.id, 3);
    });

    it('should remove catch record, delete catchAttempts and remove battle info from Valkey', async () => {
      const result = await service.giveup(fakeUser.id);
      expect(repo.getCatchRecordByUser).toHaveBeenCalledWith(fakeUser.id, [
        'pinkmong',
      ]);
      expect(repo.removeCatchPinkmong).toHaveBeenCalledWith(fakeCatchRecord);
      expect(valkeyService.del).toHaveBeenCalledWith(
        `pinkmong_battle:${fakeUser.id}`,
      );
      expect(service['catchAttempts'].has(fakeCatchRecord.id)).toBe(false);
      expect(result).toEqual({
        message: '성공적으로 도망쳤습니다!',
        success: false,
      });
    });
  });
});
