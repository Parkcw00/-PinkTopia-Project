import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateItemDto {

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ example: '1' })
    storeItemId: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ example: '1' })
    inventoryId: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ example: '5' })
    count: number;
}
