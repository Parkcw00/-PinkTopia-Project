import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateStoreItemDto } from './dto/create-store-item.dto';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';
import { StoreItem } from './entities/store-item.entity';
import { StoreItemRepository } from './store-item.repository';
// import { User } from 'src/user/entities/user.entity';

@Injectable()
export class StoreItemService {
  constructor(
    private storeItemRepository: StoreItemRepository,
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

    const storeItem = await this.storeItemRepository.addShopItem(createStoreItemDto);

    return storeItem;
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
    return this.storeItemRepository.findAll();
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

    const storeItem = await this.storeItemRepository.storeItemFindOne(id);
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }
    return storeItem;
  }

  async updateStoreItem(id: number, updateStoreItemDto: UpdateStoreItemDto): Promise<StoreItem | null> {
    // const checkMember = await this.userRepository.findOne({
    //   where: { id: userId },
    // });
    // if (!checkMember) {
    //   throw new NotFoundException(
    //     '수정할 수 있는 권한이 존재하지 않습니다.',
    //   );
    // }

    const storeItem = await this.storeItemRepository.storeItemFindOne(id);
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }

    return this.storeItemRepository.updateStoreItem(id, updateStoreItemDto);
  }

  async deleteStoreItem(id: number) {  
    // const checkMember = await this.userRepository.findOne({
    //   where: { id: userId },
    // });
    // if (!checkMember) {
    //   throw new NotFoundException(
    //     '삭제할 수 있는 권한이 존재하지 않습니다.',
    //   );
    // }

    const storeItem = await this.storeItemRepository.storeItemFindOne(id);
    if (!storeItem) {
      throw new NotFoundException('존재하지 않는 상점 아이템입니다.');
    }

    return this.storeItemRepository.deleteStoreItem(id);
  }
}
