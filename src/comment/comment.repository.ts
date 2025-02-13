import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async createComment(post_id: number, user_id: number, content: string) {
    const newComment = this.commentRepository.create({
      post_id,
      user_id,
      content,
    });
    return await this.commentRepository.save(newComment);
  }

  async findComments(): Promise<Comment[]> {
    return await this.commentRepository.find();
  }

  async findComment(id: number): Promise<Comment | null> {
    return await this.commentRepository.findOne({ where: { id } });
  }

  async updateComment(id: number, updateData: Partial<Comment>): Promise<void> {
    await this.commentRepository.update({ id }, updateData);
  }

  async deleteComment(id: number): Promise<void> {
    await this.commentRepository.delete({ id });
  }
}
