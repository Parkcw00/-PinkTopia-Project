import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
  constructor(private readonly postRepository: PostRepository) {}

  async create(user_id: number, createPostDto: CreatePostDto) {
    const { title, content } = createPostDto;
    return await this.postRepository.createPost(user_id, title, content);
  }

  async findPosts(): Promise<Post[]> {
    return await this.postRepository.findPosts();
  }

  async findPost(id: number): Promise<Post> {
    const post = await this.postRepository.findPost(id);
    if (!post) {
      throw new NotFoundException(`게시글을 찾을 수 없습니다.`);
    }
    return post;
  }

  async updatePost(
    user_id: number,
    id: number,
    updatePostDto: UpdatePostDto,
  ): Promise<void> {
    const { title, content } = updatePostDto;
    await this.verifyMessage(id, user_id);
    await this.postRepository.updatePost(id, { title, content });
  }

  async deletePost(user_id: number, id: number) {
    await this.verifyMessage(id, user_id);
    await this.postRepository.deletePost(id);
  }

  private async verifyMessage(id: number, user_id: number) {
    const postMessage = await this.postRepository.findPost(id);
    if (!postMessage || postMessage.user_id !== user_id) {
      throw new NotFoundException(
        '게시글을 찾을 수 없거나 수정/삭제할 권한이 없습니다.',
      );
    }
  }
}
