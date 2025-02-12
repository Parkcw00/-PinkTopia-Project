import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async create(user_id: number, createPostDto: CreatePostDto) {
    const { title, content } = createPostDto;
    const newPost = this.postRepository.create({
      user_id,
      title,
      content,
    });
    const savePost = await this.postRepository.save(newPost);
    return savePost;
  }

  async findPosts(): Promise<Post[]> {
    const posts = await this.postRepository.findBy({});

    return posts;
  }

  async findPost(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: {
        id: id,
      },
    });
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
    await this.postRepository.update({ id }, { title, content });
  }

  async deletePost(user_id: number, id: number) {
    await this.verifyMessage(id, user_id);
    await this.postRepository.delete({ id });
  }

  private async verifyMessage(id: number, user_id: number) {
    const postMessage = await this.postRepository.findOneBy({
      id,
    });
    if (!postMessage || postMessage.user_id !== user_id) {
      throw new NotFoundException(
        '게시글을 찾을 수 없거나 수정/삭제할 권한이 없습니다.',
      );
    }
  }
}
