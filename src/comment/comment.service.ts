import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentRepository } from './comment.repository';
import { PostRepository } from '../post/post.repository';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
  ) {}

  async createComment(
    user_id: number,
    post_id: number,
    createCommentDto: CreateCommentDto,
  ) {
    const post = await this.postRepository.findPost(post_id);
    if (!post) {
      throw new NotFoundException(`게시물이 존재하지 않습니다.`);
    }
    const { content } = createCommentDto;
    return await this.commentRepository.createComment(
      post_id,
      user_id,
      content,
    );
  }

  async findComments(post_id: number) {
    const post = await this.postRepository.findPost(post_id);
    if (!post) {
      throw new NotFoundException(`게시물이 존재하지 않습니다.`);
    }
    return await this.commentRepository.findComments();
  }

  async findComment(id: number) {
    const comment = await this.commentRepository.findComment(id);
    if (!comment) {
      throw new NotFoundException(`댓글을 찾을 수 없습니다.`);
    }
    return comment;
  }

  async updateComment(
    user_id: number,
    id: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<void> {
    const { content } = updateCommentDto;
    await this.verifyMessage(id, user_id);
    await this.commentRepository.updateComment(id, { content });
  }

  async deleteComment(user_id: number, id: number) {
    await this.verifyMessage(id, user_id);
    await this.commentRepository.deleteComment(id);
  }

  private async verifyMessage(id: number, user_id: number) {
    const commentMessage = await this.commentRepository.findComment(id);
    if (!commentMessage || commentMessage.user_id !== user_id) {
      throw new NotFoundException(
        '댓글을 찾을 수 없거나 수정/삭제할 권한이 없습니다.',
      );
    }
  }
}
