import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateItemDto {

    @IsNotEmpty()
    @IsNumber()
    storeItemId: number;

    @IsNotEmpty()
    @IsNumber()
    inventoryId: number;

    @IsNotEmpty()
    @IsNumber()
    count: number;
}
