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
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserGuard } from '../user/guards/user-guard';

@ApiTags('게시글CRUD')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}
  @ApiOperation({ summary: '게시글 생성' })
  @Post()
  @UseGuards(UserGuard)
  async createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
    const userId = req.user.id;
    return await this.postService.createPost(userId, createPostDto);
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
  @Patch(':id')
  @UseGuards(UserGuard)
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const userId = req.user.id;
    return await this.postService.updatePost(userId, +id, updatePostDto);
  }

  @ApiOperation({ summary: '게시글 삭제' })
  @Delete(':id')
  @UseGuards(UserGuard)
  async remove(@Request() req, @Param('id') id: number) {
    const userId = req.user.id;
    return await this.postService.deletePost(userId, +id);
  }
}
