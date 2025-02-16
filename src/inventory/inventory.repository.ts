import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Inventory } from "./entities/inventory.entity";
import { Item } from "src/item/entities/item.entity";
import { plainToInstance } from "class-transformer";
import { CreateItemDto } from "src/item/dto/create-item.dto";

@Injectable()
export class InventoryRepository {
    constructor(
        @InjectRepository(Inventory)
        private inventoryRepository: Repository<Inventory>,
        @InjectRepository(Item)
        private itemRepository: Repository<Item>,
    ) {}

    async create(createItemDto: CreateItemDto): Promise<Item> {
        const item = plainToInstance(Item, createItemDto);
        return this.itemRepository.save(item);
    }

    // 모든 인벤토리 조회
    async findAll(): Promise<Item[]> {
        return this.itemRepository.find();
    }

    // 인벤토리 조회
    async findOne(id: number): Promise<Item | null> {
        return this.itemRepository.findOne({ where: { id } });
    }

    async findOneByInventoryId(id: number) {
        return this.inventoryRepository.findOne({ where: { id } });
    }


}
