import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateItemDto {

    @IsNotEmpty()
    @IsNumber()
    storeItemId: number;
}
