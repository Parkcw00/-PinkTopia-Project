import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserGuard } from 'src/user/guards/user-guard';

@ApiTags('인벤토리 CRUD')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiOperation({ summary: '유저의 인벤토리에 있는 아이템 조회' })
  @UseGuards(UserGuard)
  @Get()
  findItemsInInventory(@Request() req) {
    const userId = req.user.id;
    return this.inventoryService.findItemsByUserId(userId);
  }
}
