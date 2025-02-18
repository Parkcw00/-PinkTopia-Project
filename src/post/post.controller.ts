import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserGuard } from '../user/guards/user-guard';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('게시글CRUD')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}
  @ApiOperation({ summary: '게시글 생성' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(UserGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  async createPost(
    @Request() req,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.postService.createPost(req.user.id, createPostDto, files);
  }

  @ApiOperation({ summary: '게시글들 조회' })
  @Get()
  async findPosts() {
    return await this.postService.findPosts();
  }

  @ApiOperation({ summary: '게시글 조회' })
  @Get(':id')
  async findPost(@Param('id') id: number) {
    return await this.postService.findPost(+id);
  }

  @ApiOperation({ summary: '게시글 수정' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(UserGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files'))
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.postService.updatePost(
      req.user.id,
      +id,
      updatePostDto,
      files,
    );
  }

  @ApiOperation({ summary: '게시글 삭제' })
  @UseGuards(UserGuard)
  @Delete(':id')
  async remove(@Request() req, @Param('id') id: number) {
    return await this.postService.deletePost(req.user.id, +id);
  }
}
