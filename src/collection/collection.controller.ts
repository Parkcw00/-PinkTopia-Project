import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { CollectionService } from './collection.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { UseGuards } from '@nestjs/common';
import { UserGuard } from '../user/guards/user-guard';
import { AdminGuard } from '../user/guards/admin.guard';
import { userInfo } from 'os';

@Controller('collection')
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  // @Post('collections')
  // @UseGuards(UserGuard, AdminGuard)
  // create(@Body() createCollectionDto: CreateCollectionDto) {
  //   return this.collectionService.createCollection(createCollectionDto);
  // }

  @Get('collections')
  @UseGuards(UserGuard)
  findAll(@Request() req) {
    // UserGuard가 req.user에 인증된 유저 정보를 담아둔다고 가정
    const userId = req.user.id;
    return this.collectionService.findCollectionsByUser(userId);
  }

  @Get('status')
  @UseGuards(UserGuard)
  async getCollectionStatus(@Request() req) {
    const result = await this.collectionService.getCollectionStatus(req.user.id);
    return result;
  }

  // @Patch('collections/:collectionId')
  // update(
  //   @Param('collectionId') collectionId: string,
  //   @Body() updateCollectionDto: UpdateCollectionDto,
  // ) {
  //   return this.collectionService.updateCollection(
  //     Number(collectionId),
  //     updateCollectionDto,
  //   );
  // }

  @Delete('collections/:collectionId')
  remove(@Param('collectionId') collectionId: string) {
    return this.collectionService.deleteCollection(Number(collectionId));
  }
}
