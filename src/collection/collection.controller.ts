import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post('collections')
  create(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionService.createCollection(createCollectionDto);
  }

  @Get('collections')
  findAll() {
    return this.collectionService.findCollections();
  }

  @Patch('collections/:collectionId')
  update(
    @Param('collectionId') collectionId: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ) {
    return this.collectionService.updateCollection(
      Number(collectionId),
      updateCollectionDto,
    );
  }

  @Delete('collections/:collectionId')
  remove(@Param('collectionId') collectionId: string) {
    return this.collectionService.deleteCollection(Number(collectionId));
  }
}
