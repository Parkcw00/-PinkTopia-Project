import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserGuard } from '../user/guards/user-guard';

@ApiTags('댓글CRUD')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @ApiOperation({ summary: '댓글 생성' })
  @Post(':post_id')
  @UseGuards(UserGuard)
  async create(
    @Request() req,
    @Param('post_id', ParseIntPipe) post_id: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = req.user.id;
    return await this.commentService.createComment(
      userId,
      post_id,
      createCommentDto,
    );
  }

  @ApiOperation({ summary: '댓글들 조회' })
  @Get(':post_id')
  async findAll(@Param('post_id', ParseIntPipe) post_id: number) {
    return await this.commentService.findComments(post_id);
  }

  @ApiOperation({ summary: '댓글 수정' })
  @Patch(':post_id/comments/:id')
  @UseGuards(UserGuard)
  async update(
    @Request() req,
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const userId = req.user.id;
    return await this.commentService.updateComment(
      userId,
      +id,
      updateCommentDto,
    );
  }

  @ApiOperation({ summary: '댓글 삭제' })
  @Delete(':post_id/comments/:id')
  @UseGuards(UserGuard)
  async remove(@Request() req, @Param('id') id: number) {
    const userId = req.user.id;
    return await this.commentService.deleteComment(userId, +id);
  }
}
