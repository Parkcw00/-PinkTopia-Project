import { Controller, Get, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('인벤토리 CRUD')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @ApiOperation({ summary: '인벤토리 조회' })
  @Get()
  findAll() {
    return this.inventoryService.findAll();
  }

  @ApiOperation({ summary: '특정 인벤토리 상세 조회' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }


}
