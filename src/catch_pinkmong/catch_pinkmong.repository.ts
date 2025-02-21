// catch_pinkmong.repository.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatchPinkmong } from 'src/catch_pinkmong/entities/catch_pinkmong.entity';
import { User } from 'src/user/entities/user.entity';
import { Pinkmong } from 'src/pinkmong/entities/pinkmong.entity';
import { Inventory } from 'src/inventory/entities/inventory.entity';
import { Collection } from 'src/collection/entities/collection.entity';
import { Item } from 'src/item/entities/item.entity';

@Injectable()
export class CatchPinkmongRepository {
  constructor(
    @InjectRepository(CatchPinkmong)
    private catchPinkmongRepo: Repository<CatchPinkmong>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Pinkmong)
    private pinkmongRepo: Repository<Pinkmong>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
    @InjectRepository(Item)
    private itemRepo: Repository<Item>,
    @InjectRepository(Collection)
    private collectionRepo: Repository<Collection>,
  ) {}

  async getUser(userId: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('유저를 찾을 수 없습니다.');
    return user;
  }

  async getInventoryByUser(user: User): Promise<Inventory> {
    const inventory = await this.inventoryRepo.findOne({
      where: { user_id: user.id },
    });
    if (!inventory)
      throw new NotFoundException('해당 유저의 인벤토리를 찾을 수 없습니다.');
    return inventory;
  }

  async getExistingCatchByInventory(
    inventoryId: number,
  ): Promise<CatchPinkmong | null> {
    return await this.catchPinkmongRepo.findOne({
      where: { inventory_id: inventoryId },
    });
  }

  async getRandomRegionByGrade(selectedGrade: string): Promise<string> {
    const result = await this.pinkmongRepo
      .createQueryBuilder('p')
      .select('p.region_theme', 'region')
      .where('p.grade = :grade', { grade: selectedGrade })
      .groupBy('p.region_theme')
      .orderBy('RAND()')
      .getRawOne();
    if (!result)
      throw new NotFoundException(
        '해당 등급에 등록된 region_theme이 없습니다.',
      );
    return result.region;
  }

  async getRandomPinkmongByGradeAndRegion(
    grade: string,
    region: string,
  ): Promise<Pinkmong> {
    const pinkmong = await this.pinkmongRepo
      .createQueryBuilder('p')
      .where('p.grade = :grade', { grade })
      .andWhere('p.region_theme = :region', { region })
      .orderBy('RAND()')
      .getOne();
    if (!pinkmong)
      throw new NotFoundException(
        '해당 등급 및 region_theme에 해당하는 pinkmong이 없습니다.',
      );
    return pinkmong;
  }

  async getExistingCatch(
    userId: number,
    pinkmongId: number,
    inventoryId: number,
  ): Promise<CatchPinkmong | null> {
    return await this.catchPinkmongRepo.findOne({
      where: {
        user_id: userId,
        pinkmong_id: pinkmongId,
        inventory_id: inventoryId,
      },
    });
  }

  async createCatchPinkmong(
    user: User,
    inventory: Inventory,
    pinkmong: Pinkmong,
  ): Promise<CatchPinkmong> {
    const catchPinkmong = this.catchPinkmongRepo.create({
      user,
      user_id: user.id,
      pinkmong_id: pinkmong.id,
      inventory,
      inventory_id: inventory.id,
    });
    return await this.catchPinkmongRepo.save(catchPinkmong);
  }

  async removeCatchPinkmong(catchRecord: CatchPinkmong) {
    await this.catchPinkmongRepo.remove(catchRecord);
  }

  async getCatchRecordByUser(userId: number, relations: string[] = []) {
    const record = await this.catchPinkmongRepo.findOne({
      where: { user_id: userId },
      relations,
    });
    if (!record) throw new NotFoundException('해당 핑크몽을 잡을 수 없습니다.');
    return record;
  }

  async getItemById(itemId: number): Promise<Item> {
    const item = await this.itemRepo.findOne({
      where: { id: itemId },
      relations: ['inventory'],
    });
    if (!item) throw new NotFoundException('아이템을 찾을 수 없습니다.');
    return item;
  }

  async updateItem(item: Item): Promise<Item> {
    return await this.itemRepo.save(item);
  }

  async getCollection(userId: number, pinkmongId: number) {
    return await this.collectionRepo.findOne({
      where: { user_id: userId, pinkmong_id: pinkmongId },
    });
  }

  async createCollection(user: User, pinkmong: Pinkmong) {
    const collection = this.collectionRepo.create({
      user,
      user_id: user.id,
      pinkmong,
      pinkmong_id: pinkmong.id,
    });
    return await this.collectionRepo.save(collection);
  }
}
