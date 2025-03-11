import { Test, TestingModule } from '@nestjs/testing';
import { PinkmongController } from './pinkmong.controller';
import { PinkmongService } from './pinkmong.service';
import { CreatePinkmongDto } from './dto/create-pinkmong.dto';
import { UpdatePinkmongDto } from './dto/update-pinkmong.dto';
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';
import { InventoryService } from '../inventory/inventory.service';

describe('PinkmongController', () => {
  let pinkmongController: PinkmongController;
  let pinkmongService: jest.Mocked<PinkmongService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PinkmongController],
      providers: [
        {
          provide: PinkmongService,
          useValue: {
            createPinkmong: jest.fn(),
            getAllPinkmongs: jest.fn(),
            getPinkmong: jest.fn(),
            updatePinkmong: jest.fn(),
            deletePinkmong: jest.fn(),
          },
        },
        {
          provide: InventoryService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(UserGuard)
      .useValue({})
      .overrideGuard(AdminGuard)
      .useValue({})
      .compile();

    pinkmongController = module.get<PinkmongController>(PinkmongController);
    pinkmongService = module.get(PinkmongService);
  });

  it('정상적으로 정의되어야 한다.', () => {
    expect(pinkmongController).toBeDefined();
  });

  // 1️⃣ **핑크몽 생성 테스트**
  describe('createPinkmong', () => {
    it('핑크몽을 생성하고 반환해야 한다.', async () => {
      const createPinkmongDto: CreatePinkmongDto = {
        name: '핑크몽A',
        location_url: 'https://example.com/location',
        explain: '핑크몽 설명',
        region_theme: 'forest',
        grade: 'epic',
        point: 100,
      };
      const file = { buffer: Buffer.from('file data') } as Express.Multer.File;
      const expectedResult = {
        id: 1,
        ...createPinkmongDto,
        pinkmong_image: 'https://s3.example.com/imageA.png',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: undefined,
        catch_pinkmong: [],
        collection: [],
      };

      pinkmongService.createPinkmong.mockResolvedValue(expectedResult);

      const result = await pinkmongController.createPinkmong(
        createPinkmongDto,
        file,
      );

      expect(result).toEqual(expectedResult);
      expect(pinkmongService.createPinkmong).toHaveBeenCalledWith(
        createPinkmongDto,
        file,
      );
    });
  });

  // 2️⃣ **모든 핑크몽 조회**
  describe('getAllPinkmongs', () => {
    it('모든 핑크몽을 조회하고 반환해야 한다.', async () => {
      const pinkmongs = [
        {
          id: 1,
          name: '핑크몽A',
          pinkmong_image: 'https://s3.example.com/imageA.png',
          explain: '핑크몽 설명',
          region_theme: 'forest',
          grade: 'epic',
          point: 100,
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
          deleted_at: undefined,
          catch_pinkmong: [],
          collection: [],
        },
      ];

      pinkmongService.getAllPinkmongs.mockResolvedValue({
        message: '핑크몽 전체 조회 성공',
        pinkmongs,
      });

      const result = await pinkmongController.getAllPinkmongs();

      expect(result).toEqual({ message: '핑크몽 전체 조회 성공', pinkmongs });
      expect(pinkmongService.getAllPinkmongs).toHaveBeenCalled();
    });
  });

  // 3️⃣ **특정 핑크몽 조회**
  describe('getPinkmong', () => {
    it('특정 핑크몽을 조회하고 반환해야 한다.', async () => {
      const pinkmong = {
        id: 1,
        name: '핑크몽A',
        pinkmong_image: 'https://s3.example.com/imageA.png',
        location_url: 'https://example.com/location',
        explain: '핑크몽 설명',
        region_theme: 'forest',
        grade: 'epic',
        point: 100,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        deleted_at: undefined,
        catch_pinkmong: [],
        collection: [],
      };

      pinkmongService.getPinkmong.mockResolvedValue(pinkmong);

      const result = await pinkmongController.getPinkmong(1);

      expect(result).toEqual(pinkmong);
      expect(pinkmongService.getPinkmong).toHaveBeenCalledWith(1);
    });
  });

  // 4️⃣ **핑크몽 수정**
  describe('updatePinkmong', () => {
    it('핑크몽을 수정하고 성공 메시지를 반환해야 한다.', async () => {
      const updatePinkmongDto: UpdatePinkmongDto = {
        name: '수정된 핑크몽',
        explain: '수정된 설명',
        region_theme: 'desert',
        grade: 'legendary',
        point: 200,
      };

      const file = { buffer: Buffer.from('file data') } as Express.Multer.File;
      const expectedResult = { message: '핑크몽 수정이 완료 되었습니다.' };

      pinkmongService.updatePinkmong.mockResolvedValue(expectedResult);

      const result = await pinkmongController.updatePinkmong(
        1,
        updatePinkmongDto,
        file,
      );

      expect(result).toEqual(expectedResult);
      expect(pinkmongService.updatePinkmong).toHaveBeenCalledWith(
        1,
        updatePinkmongDto,
        file,
      );
    });
  });

  // 5️⃣ **핑크몽 삭제**
  describe('deletePinkmong', () => {
    it('핑크몽을 삭제하고 성공 메시지를 반환해야 한다.', async () => {
      const expectedResult = { message: '핑크몽 삭제가 완료 되었습니다.' };

      pinkmongService.deletePinkmong.mockResolvedValue(expectedResult);

      const result = await pinkmongController.deletePinkmong(1);

      expect(result).toEqual(expectedResult);
      expect(pinkmongService.deletePinkmong).toHaveBeenCalledWith(1);
    });
  });
});
