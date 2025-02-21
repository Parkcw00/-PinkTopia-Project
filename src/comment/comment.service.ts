import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentRepository } from './comment.repository';
import { PostRepository } from '../post/post.repository';
import { ValkeyService } from 'src/valkey/valkey.service';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
    private readonly valkeyService: ValkeyService,
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
    await this.valkeyService.del(`comments:${post_id}`);

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
    const comments = await this.commentRepository.findComments(post_id);
    const cachedcomments: any = await this.valkeyService.get(
      `comments:${post_id}`,
    );
    if (cachedcomments) {
      console.log(comments);
      return comments; // 캐시된 데이터 반환
    }
    await this.valkeyService.set(`comments:${post_id}`, comments, 60);
    return comments;
  }

  async updateComment(
    user_id: number,
    id: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<void> {
    const { content } = updateCommentDto;
    await this.verifyMessage(id, user_id);
    const commentMessage = await this.commentRepository.findComment(id);
    const comment = await this.commentRepository.updateComment(id, { content });
    await this.valkeyService.del(`comments:${commentMessage?.post_id}`);
    return comment;
  }

  async deleteComment(user_id: number, id: number) {
    await this.verifyMessage(id, user_id);
    const commentMessage = await this.commentRepository.findComment(id);
    await this.commentRepository.deleteComment(id);
    await this.valkeyService.del(`comments:${commentMessage?.post_id}`);
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
