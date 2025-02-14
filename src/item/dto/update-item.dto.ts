import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateItemDto extends PartialType(CreateItemDto) {

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({ example: '5' })
    count: number;
}
