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
import { userInfo } from 'os';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post() 
  purchaseItem(
    // @userInfo() userInfo: UserInfo,
    @Body() createItemDto: CreateItemDto) {
    return this.itemService.purchaseItem(/*userInfo.id,*/ createItemDto);
  }

  @Get()
  findAll() {
    return this.itemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
  //   return this.itemService.update(+id, updateItemDto);
  // }

  @Delete(':id')
  sellItem(@Param('id') id: string) {
    return this.itemService.sellItem(+id);
  }
}
