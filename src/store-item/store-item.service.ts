import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStoreItemDto } from './dto/create-store-item.dto';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';
import { StoreItem } from './entities/store-item.entity';
import { StoreItemRepository } from './store-item.repository';
import * as AWS from 'aws-sdk';

@Injectable()
export class StoreItemService {
  private s3: AWS.S3;

  constructor(private storeItemRepository: StoreItemRepository) {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_KEY || '',
      },
    });
  }

  async addShopItem(
    req: Request,
    createStoreItemDto: CreateStoreItemDto,
    file: Express.Multer.File,
  ): Promise<StoreItem> {
    const uniqueFileName = `${Date.now()}-${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: uniqueFileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const uploadResult = await this.s3.upload(params).promise();
    const item_image = uploadResult.Location;

    const storeItemData = {
      ...createStoreItemDto,
      item_image,
    };

    const storeItem = await this.storeItemRepository.addShopItem(storeItemData);
    return storeItem;
  }

  async findAll(): Promise<StoreItem[]> {
    return this.storeItemRepository.findAll();
  }

  async findOne(id: number): Promise<StoreItem> {
    const storeItem = await this.storeItemRepository.storeItemFindOne(id);
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }
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
