import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Item } from "./entities/item.entity";
import { CreateItemDto } from "./dto/create-item.dto";
import { UpdateItemDto } from "./dto/update-item.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class ItemRepository {
    constructor(
        @InjectRepository(Item)
        private itemRepository: Repository<Item>,
    ) {}

    async findAll(): Promise<Item[]> {
        return this.itemRepository.find();
    }

    async findOne(id: number): Promise<Item | null> {
        return this.itemRepository.findOne({ where: { id } });
    }

    async buyItem(createItemDto: CreateItemDto): Promise<Item> {
        const item = plainToInstance(Item, createItemDto);
        return this.itemRepository.save(item);
    }

    async updateItem(id: number, updateItemDto: UpdateItemDto): Promise<Item | null> {
        const item = plainToInstance(Item, updateItemDto);
        await this.itemRepository.update(id, item);
        return this.findOne(id);
    }

    async deleteItem(id: number): Promise<void> {
        await this.itemRepository.delete(id);
    }
}
