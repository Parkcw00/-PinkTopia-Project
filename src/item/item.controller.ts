import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
// import { userInfo } from 'os';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('아이템CRUD')
@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @ApiOperation({ summary: '아이템 구매' })
  @Post() // 아이템 구매
  purchaseItem(
    // @userInfo() userInfo: UserInfo,
    @Body() createItemDto: CreateItemDto) {
    return this.itemService.purchaseItem(/*userInfo.id,*/ createItemDto);
  }

  // 아이템 수정인데 나중에 필요하면 추가
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
  //   return this.itemService.update(+id, updateItemDto);
  // }

  @ApiOperation({ summary: '아이템 판매' })
  @Delete(':id')
  sellItem(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto
  ) {
    return this.itemService.sellItem(+id, updateItemDto);
  }
}
