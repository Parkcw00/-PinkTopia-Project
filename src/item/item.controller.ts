import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserGuard } from '../user/guards/user-guard';

@ApiTags('아이템CRUD')
@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @ApiOperation({ summary: '아이템 구매' })
  @UseGuards(UserGuard)
  @Post() // 아이템 구매
  purchaseItem(
    @Request() req,
    @Body() createItemDto: CreateItemDto) {
    const userId = req.user.id; // 유저 ID 가져오기
    return this.itemService.purchaseItem(userId, createItemDto);
  }


  @ApiOperation({ summary: '아이템 판매' })
  @UseGuards(UserGuard)
  @Delete(':id')
  sellItem(
    @Request() req,
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto
  ) {
    const userId = req.user.id; // 유저 ID 가져오기
    return this.itemService.sellItem(userId, +id, updateItemDto);
  }
}
