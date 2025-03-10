import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';
import { StoreItem } from './entities/store-item.entity';
import { StoreItemRepository } from './store-item.repository';
import { S3Service } from '../s3/s3.service';
import { CreateStoreItemDto } from './dto/create-store-item.dto';
import { ValkeyService } from '../valkey/valkey.service';

@Injectable()
export class StoreItemService {
  constructor(
    private readonly storeItemRepository: StoreItemRepository,
    private readonly s3Service: S3Service,
    private readonly valkeyService: ValkeyService,
  ) {}

  // 🔹 모든 상점 아이템 조회 (Valkey 적용)
  async findAll(): Promise<StoreItem[]> {
    const cacheKey = 'store_items';

    // Valkey에서 먼저 조회
    const cachedData = await this.valkeyService.get<StoreItem[]>(cacheKey);
    if (cachedData !== null) {
      return cachedData as StoreItem[];   
    }

    // Valkey에 데이터가 없으면 DB에서 조회 후 캐싱
    const storeItems = await this.storeItemRepository.findAll();
    await this.valkeyService.set(cacheKey, storeItems, 300);

    return storeItems;
  }

  // 🔹 특정 상점 아이템 조회 (Valkey 적용)
  async storeItemFindOne(id: number): Promise<StoreItem | null> {
    const cacheKey = `store_item:${id}`;

    // Valkey에서 먼저 조회
    const cachedData = await this.valkeyService.get<StoreItem>(cacheKey);
    if (cachedData !== null) {
      return cachedData as StoreItem;
    }

    // Valkey에 데이터가 없으면 DB에서 조회 후 캐싱
    const storeItem = await this.storeItemRepository.storeItemFindOne(id);
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }

    await this.valkeyService.set(cacheKey, storeItem, 300);
    return storeItem;
  }

  // 🔹 상점 아이템 추가 (기존 로직 유지 - Valkey 사용 X)
  async addShopItem(
    req: Request,
    createStoreItemDto: CreateStoreItemDto,
    file: Express.Multer.File,
  ): Promise<StoreItem> {
    const item_image = await this.s3Service.uploadFile(file);

    const storeItemData = {
      ...createStoreItemDto,
      item_image,
    };

    return this.storeItemRepository.addShopItem(storeItemData);
  }

  // 🔹 상점 아이템 수정 (기존 로직 유지 - Valkey 사용 X)
  async updateStoreItem(
    req: Request,
    id: number,
    updateStoreItemDto: UpdateStoreItemDto,
    file?: Express.Multer.File,
  ): Promise<StoreItem | null> {
    const storeItem = await this.storeItemRepository.storeItemFindOne(id);
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }
    // 🔹 파일이 존재하면 S3에 업로드 후 URL 업데이트
    let item_image = storeItem.item_image;
    if (file) {
      item_image = await this.s3Service.uploadFile(file);
    }

    const updatedData = {
      ...updateStoreItemDto,
      item_image, 
    };

    const updatedItem = await this.storeItemRepository.updateStoreItem(
      id,
      updatedData,
    );

    // 🔹 Valkey 캐시 갱신 (중요)
    const cacheKey = `store_item:${id}`;
    await this.valkeyService.set(cacheKey, updatedItem, 300);

    return updatedItem;
  }

  // 🔹 상점 아이템 삭제 (기존 로직 유지 - Valkey 사용 X)
  async deleteStoreItem(req: Request, id: number) {
    const storeItem = await this.storeItemRepository.storeItemFindOne(id);
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }

    return this.storeItemRepository.deleteStoreItem(id);
  }
}
