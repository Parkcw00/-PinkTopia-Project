import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StoreItem } from "./entities/store-item.entity";
import { CreateStoreItemDto } from "./dto/create-store-item.dto";
import { plainToInstance } from "class-transformer";
import { UpdateStoreItemDto } from "./dto/update-store-item.dto";

@Injectable()
export class StoreItemRepository {
    constructor(
        @InjectRepository(StoreItem)
        private storeItemRepository: Repository<StoreItem>,
    ) {}
    
    // 모든 상점 아이템 조회
    async findAll(): Promise<StoreItem[]> {
        return this.storeItemRepository.find();
    }

    // 상점 아이템 조회
    async storeItemFindOne(id: number): Promise<StoreItem | null> {
        return this.storeItemRepository.findOne({ where: { id } });
    }
    

    // 상점 아이템 추가
    async addShopItem(createStoreItemDto: CreateStoreItemDto): Promise<StoreItem> {
        const storeItem = plainToInstance(StoreItem, createStoreItemDto);
        return this.storeItemRepository.save(storeItem);
    }

    // 상점 아이템 수정 
    async updateStoreItem(id: number, updateStoreItemDto: UpdateStoreItemDto): Promise<StoreItem | null> {
        const storeItem = plainToInstance(StoreItem, updateStoreItemDto);
        await this.storeItemRepository.update(id, storeItem);
        return this.storeItemFindOne(id);
    }

    // 상점 아이템 삭제 
    async deleteStoreItem(id: number): Promise<void> {
        await this.storeItemRepository.delete(id);
    }
}
