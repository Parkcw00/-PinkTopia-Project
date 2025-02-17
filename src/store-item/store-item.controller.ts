import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StoreItemService } from './store-item.service';
import { CreateStoreItemDto } from './dto/create-store-item.dto';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserGuard } from 'src/user/guards/user-guard';

@ApiTags('상점 아이템 CRUD')
@Controller('store-item')
export class StoreItemController {
  constructor(private readonly storeItemService: StoreItemService) {}

  @ApiOperation({ summary: '상점 아이템 추가' })
  @UseGuards(UserGuard)
  @Post()
  create(
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
  @UseGuards(UserGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreItemDto: UpdateStoreItemDto) {
    return this.storeItemService.updateStoreItem(+id, updateStoreItemDto);
  }

  @ApiOperation({ summary: '상점 아이템 삭제' })
  @UseGuards(UserGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeItemService.deleteStoreItem(+id);
  }
}
