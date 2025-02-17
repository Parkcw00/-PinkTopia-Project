import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StoreItemService } from './store-item.service';
// import { User } from 'src/user/entities/user.entity';
import { CreateStoreItemDto } from './dto/create-store-item.dto';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';
// import { UserInfo } from '../utils/userInfo.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('상점 아이템 CRUD')
@Controller('store-item')
export class StoreItemController {
  constructor(private readonly storeItemService: StoreItemService) {}

  @ApiOperation({ summary: '상점 아이템 추가' })
  @Post()
  create(
    // @UserInfo() user: User,
    @Body() createStoreItemDto: CreateStoreItemDto,
  ) {
    return this.storeItemService.addShopItem(createStoreItemDto);
  }

  @ApiOperation({ summary: '상점 아이템 조회' })
  @Get()
  findAll() {
    return this.storeItemService.findAll();
  }

  @ApiOperation({ summary: '상점 아이템 상세 조회' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeItemService.findOne(+id);
  }

  @ApiOperation({ summary: '상점 아이템 수정' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreItemDto: UpdateStoreItemDto) {
    return this.storeItemService.updateStoreItem(+id, updateStoreItemDto);
  }

  @ApiOperation({ summary: '상점 아이템 삭제' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeItemService.deleteStoreItem(+id);
  }
}
