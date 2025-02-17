import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StoreItemService } from './store-item.service';
import { CreateStoreItemDto } from './dto/create-store-item.dto';
import { UpdateStoreItemDto } from './dto/update-store-item.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserGuard } from 'src/user/guards/user-guard';
import { AdminGuard } from 'src/user/guards/admin.guard';

@ApiTags('상점 아이템 CRUD')
@Controller('store-item')
export class StoreItemController {
  constructor(private readonly storeItemService: StoreItemService) {}

  @ApiOperation({ summary: '상점 아이템 추가' })
  @UseGuards(UserGuard, AdminGuard)
  @Post()
  create(@Request() req, @Body() createStoreItemDto: CreateStoreItemDto) {
    return this.storeItemService.addShopItem(req.user, createStoreItemDto);
  }

  @ApiOperation({ summary: '상점 아이템 조회' })
  @Get()
  findAll() {
    return this.storeItemService.findAll();
  }

  // @ApiOperation({ summary: '상점 아이템 상세 조회' })
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.storeItemService.findOne(+id);
  // }

  @ApiOperation({ summary: '상점 아이템 수정' })
  @UseGuards(UserGuard, AdminGuard)
  @Patch(':id')
  update(@Request() req, @Param('id') id: number, @Body() updateStoreItemDto: UpdateStoreItemDto) {
    return this.storeItemService.updateStoreItem(req.user, id, updateStoreItemDto);
  }

  @ApiOperation({ summary: '상점 아이템 삭제' })
  @UseGuards(UserGuard, AdminGuard)
  @Delete(':id')
  delete(@Request() req, @Param('id') id: number) {
    return this.storeItemService.deleteStoreItem(req.user, id);
  }
}
