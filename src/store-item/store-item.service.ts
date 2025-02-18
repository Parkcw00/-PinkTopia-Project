import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';
import { StoreItem } from './entities/store-item.entity';
import { StoreItemRepository } from './store-item.repository';
import { S3Service } from 'src/s3/s3.service';
import { CreateStoreItemDto } from './dto/create-store-item.dto';

@Injectable()
export class StoreItemService {
  constructor(
    private readonly storeItemRepository: StoreItemRepository,
    private readonly s3Service: S3Service,
  ) {}

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

    const storeItem = await this.storeItemRepository.addShopItem(storeItemData);
    return storeItem;
  }

  async updateStoreItem(
    req: Request,
    id: number,
    updateStoreItemDto: UpdateStoreItemDto,
  ): Promise<StoreItem | null> {
    const storeItem = await this.storeItemRepository.storeItemFindOne(id);
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }
    return this.storeItemRepository.updateStoreItem(id, updateStoreItemDto);
  }

  async deleteStoreItem(req: Request, id: number) {
    const storeItem = await this.storeItemRepository.storeItemFindOne(id);
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }

    return this.storeItemRepository.deleteStoreItem(id);
  }
}
