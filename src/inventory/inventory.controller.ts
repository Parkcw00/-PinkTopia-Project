import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserGuard } from 'src/user/guards/user-guard';

@ApiTags('인벤토리 CRUD')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // @ApiOperation({ summary: '인벤토리 조회' })
  // @UseGuards(UserGuard)
  // @Get()
  // findMyInventory(@Request() req) {
  //   const userId = req.user.id; // UserGuard에 의해 추가된 사용자 정보
  //   return this.inventoryService.findOneByUserId(userId);
  // }

  @ApiOperation({ summary: '특정 인벤토리 상세 조회' })
  @UseGuards(UserGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }

  @ApiOperation({ summary: '유저의 인벤토리에 있는 아이템 조회' })
  @UseGuards(UserGuard)
  @Get()
  findItemsInInventory(@Request() req) {
    const userId = req.user.id; // UserGuard에 의해 추가된 사용자 정보
    return this.inventoryService.findItemsByUserId(userId);
  }
}
