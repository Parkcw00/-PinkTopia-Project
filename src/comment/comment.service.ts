import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentRepository } from './comment.repository';
import { PostRepository } from '../post/post.repository';
import { ValkeyService } from '../valkey/valkey.service';
import { format, toZonedTime } from 'date-fns-tz'; // ✅ 한국 시간 변환 라이브러리 추가

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
    const cachedComments: any = await this.valkeyService.get(
      `comments:${post_id}`,
    );
    if (cachedComments) {
      return cachedComments; // 캐시된 데이터 반환
    }
    const comments = await this.commentRepository.findComments(post_id);
    // ✅ 조회된 댓글들의 시간 변환 (UTC → KST)
    comments.forEach((comment) => {
      comment.created_at = this.convertToKoreanTime(comment.created_at);
      comment.updated_at = this.convertToKoreanTime(comment.updated_at);
    });

    await this.valkeyService.set(`comments:${post_id}`, comments, 60);
    return comments;
  }

  // ✅ 한국 시간 변환 함수 (Date → Date)
  private convertToKoreanTime(date: Date | null): Date {
    if (!date) return new Date(); // ✅ null이 아니라 현재 시간을 반환하도록 변경
    const timeZone = 'Asia/Seoul';
    return toZonedTime(date, timeZone);
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
