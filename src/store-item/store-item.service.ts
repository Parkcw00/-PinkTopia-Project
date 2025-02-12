import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStoreItemDto } from './dto/create-store-item.dto';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';
import { StoreItem } from './entities/store-item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
// import { User } from 'src/user/entities/user.entity';

@Injectable()
export class StoreItemService {
  constructor(
    @InjectRepository(StoreItem)
    private storeItemRepository: Repository<StoreItem>,
    // @InjectRepository(User)
    // private userRepository: Repository<User>,
    ) {}

  async addShopItem(createStoreItemDto: CreateStoreItemDto): Promise<StoreItem> {

    // const checkMember = await this.userRepository.findOne({
    //   where: { id: userId },
    // });
    // if (!checkMember) {
    //   throw new NotFoundException(
    //     '구매할 수 있는 권한이 존재하지 않습니다.',
    //   );
    // }

    const storeItem = this.storeItemRepository.create(createStoreItemDto);

    return this.storeItemRepository.save(storeItem);
  }

  async findAll(): Promise<StoreItem[]> {

    // const checkMember = await this.userRepository.findOne({
    //   where: { id: userId },
    // });
    // if (!checkMember) {
    //   throw new NotFoundException(
    //     '조회할 수 있는 권한이 존재하지 않습니다.',
    //   );
    // }
    return this.storeItemRepository.find();
  }

  async findOne(id: number): Promise<StoreItem> {

    // const checkMember = await this.userRepository.findOne({
    //   where: { id: userId },
    // });
    // if (!checkMember) {
    //   throw new NotFoundException(
    //     '조회할 수 있는 권한이 존재하지 않습니다.',
    //   );
    // }

    const storeItem = await this.storeItemRepository.findOne({ where: { id } });
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }
    return storeItem;
  }

  async update(id: number, updateStoreItemDto: UpdateStoreItemDto) {
    // const checkMember = await this.userRepository.findOne({
    //   where: { id: userId },
    // });
    // if (!checkMember) {
    //   throw new NotFoundException(
    //     '수정할 수 있는 권한이 존재하지 않습니다.',
    //   );
    // }

    const storeItem = await this.storeItemRepository.findOne({ where: { id } });
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }

    return this.storeItemRepository.update(id, updateStoreItemDto);
  }

      async remove(id: number) {  
    // const checkMember = await this.userRepository.findOne({
    //   where: { id: userId },
    // });
    // if (!checkMember) {
    //   throw new NotFoundException(
    //     '삭제할 수 있는 권한이 존재하지 않습니다.',
    //   );
    // }

    const storeItem = await this.storeItemRepository.findOne({ where: { id } });
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }

    return this.storeItemRepository.delete(id);
  }
}
