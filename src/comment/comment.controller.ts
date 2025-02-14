import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('댓글CRUD')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @ApiOperation({ summary: '댓글 생성' })
  @Post(':post_id')
  create(
    @Param('post_id', ParseIntPipe) post_id: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.createComment(1, post_id, createCommentDto);
  }

  @ApiOperation({ summary: '댓글들 조회' })
  @Get(':post_id')
  findAll(@Param('post_id', ParseIntPipe) post_id: number) {
    return this.commentService.findComments(post_id);
  }

  @ApiOperation({ summary: '댓글 수정' })
  @Patch(':post_id/comments/:id')
  update(@Param('id') id: number, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.updateComment(1, +id, updateCommentDto);
  }

  @ApiOperation({ summary: '댓글 삭제' })
  @Delete(':post_id/comments/:id')
  remove(@Param('id') id: number) {
    return this.commentService.deleteComment(1, +id);
  }
}
