import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('포스트CRUD')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}
  @ApiOperation({ summary: '게시글 생성' })
  @Post()
  createPost(@Body() createPostDto: CreatePostDto) {
    return this.postService.createPost(1, createPostDto);
  }

  @ApiOperation({ summary: '게시글들 조회' })
  @Get()
  findPosts() {
    return this.postService.findPosts();
  }

  @ApiOperation({ summary: '게시글 조회' })
  @Get(':id')
  findPost(@Param('id') id: number) {
    return this.postService.findPost(+id);
  }

  @ApiOperation({ summary: '게시글 수정' })
  @Patch(':id')
  update(@Param('id') id: number, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.updatePost(1, +id, updatePostDto);
  }

  @ApiOperation({ summary: '게시글 삭제' })
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.postService.deletePost(1, +id);
  }
}
