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

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':post_id')
  create(
    @Param('post_id', ParseIntPipe) post_id: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.createComment(1, post_id, createCommentDto);
  }

  @Get(':post_id')
  findAll(@Param('post_id', ParseIntPipe) post_id: number) {
    return this.commentService.findComments(post_id);
  }

  @Get(':post_id/comments/:id')
  findOne(@Param('id') id: number) {
    return this.commentService.findComment(+id);
  }

  @Patch(':post_id/comments/:id')
  update(@Param('id') id: number, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.updateComment(1, +id, updateCommentDto);
  }

  @Delete(':post_id/comments/:id')
  remove(@Param('id') id: number) {
    return this.commentService.deleteComment(1, +id);
  }
}
