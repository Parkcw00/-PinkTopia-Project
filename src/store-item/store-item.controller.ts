import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StoreItemService } from './store-item.service';
// import { User } from 'src/user/entities/user.entity';
import { CreateStoreItemDto } from './dto/create-store-item.dto';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';
// import { UserInfo } from '../utils/userInfo.decorator';

@Controller('store-item')
export class StoreItemController {
  constructor(private readonly storeItemService: StoreItemService) {}

  @Post()
  create(
    // @UserInfo() user: User,
    @Body() createStoreItemDto: CreateStoreItemDto,
  ) {
    return this.storeItemService.addShopItem(createStoreItemDto);
  }

  @Get()
  findAll() {
    return this.storeItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeItemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreItemDto: UpdateStoreItemDto) {
    return this.storeItemService.update(+id, updateStoreItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeItemService.remove(+id);
  }
}
