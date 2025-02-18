import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async createPost(
    user_id: number,
    title: string,
    content: string,
    post_image: string[],
  ) {
    const newPost = this.postRepository.create({
      user_id,
      title,
      content,
      post_image,
    });
    return await this.postRepository.save(newPost);
  }

  async findPosts(): Promise<Post[]> {
    return await this.postRepository.find();
  }

  async findPost(id: number): Promise<Post | null> {
    return await this.postRepository.findOne({ where: { id } });
  }

  async updatePost(id: number, updateData: Partial<Post>): Promise<void> {
    await this.postRepository.update({ id }, updateData);
  }

  async deletePost(id: number): Promise<void> {
    await this.postRepository.delete({ id });
  }
}
