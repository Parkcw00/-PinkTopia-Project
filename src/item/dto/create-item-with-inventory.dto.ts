import { CreateItemDto } from './create-item.dto';

export interface CreateItemWithInventoryDto extends CreateItemDto {
  inventoryId: number;
} 