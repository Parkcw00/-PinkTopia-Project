import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostRepository } from './post.repository';
import { S3Service } from '../s3/s3.service';
import { ValkeyService } from '../valkey/valkey.service';
import { toZonedTime } from 'date-fns-tz'; // ✅ 한국 시간 변환 라이브러리

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly s3Service: S3Service,
    private readonly valkeyService: ValkeyService,
  ) {
    // 기존의 S3 객체 생성 코드 제거
  }

  async createPost(
    user_id: number,
    createPostDto: CreatePostDto,
    files: Express.Multer.File[], // 여러 파일을 받도록 수정
  ) {
    const { title, content } = createPostDto;
    const imageUrls = await this.s3Service.uploadFiles(files); // S3Service 사용

    await this.valkeyService.del(`posts:`);
    return await this.postRepository.createPost(
      user_id,
      title,
      content,
      imageUrls,
    );
  }

  async findPosts(): Promise<Post[]> {
    const cachedPosts: any = await this.valkeyService.get(`posts:`);
    if (cachedPosts) {
      console.log(cachedPosts);
      return cachedPosts; // 캐시된 데이터 반환
    }
    const posts = await this.postRepository.findPosts();
    // ✅ 조회된 게시글들의 시간 변환 (UTC → KST)
    posts.forEach((post) => {
      post.created_at = this.convertToKoreanTime(post.created_at);
      post.updated_at = this.convertToKoreanTime(post.updated_at);
    });
    await this.valkeyService.set(`posts:`, posts, 60);
    return posts;
  }

  async findPost(id: number): Promise<Post> {
    const cachedPost: any = await this.valkeyService.get(`post:${id}`);
    if (cachedPost) {
      console.log(cachedPost);
      return cachedPost; // 캐시된 데이터 반환
    }
    const post = await this.postRepository.findPost(id);
    if (!post) {
      throw new NotFoundException(`게시글을 찾을 수 없습니다.`);
    }
    // ✅ 단일 게시글 시간 변환 (UTC → KST)
    post.created_at = this.convertToKoreanTime(post.created_at);
    post.updated_at = this.convertToKoreanTime(post.updated_at);
    await this.valkeyService.set(`post:${id}`, post, 60);
    return post;
  }

  // ✅ 한국 시간 변환 함수 (Date → Date)
  private convertToKoreanTime(date: Date | null): Date {
    if (!date) return new Date(); // ✅ null이 아니라 현재 시간을 반환하도록 변경
    const timeZone = 'Asia/Seoul';
    return toZonedTime(date, timeZone);
  }

  async updatePost(
    user_id: number,
    id: number,
    updatePostDto: UpdatePostDto,
    files?: Express.Multer.File[], // 파일을 선택적으로 받도록 수정
  ): Promise<void> {
    const { title, content } = updatePostDto;
    await this.verifyMessage(id, user_id);

    // 기존 게시글 가져오기
    const post = await this.postRepository.findPost(id);
    if (post) {
      // 기존 이미지 삭제
      for (const imageUrl of post.post_image) {
        const key = imageUrl.split('/').pop();
        if (key) {
          try {
            await this.s3Service.deleteFile(key);
          } catch (error) {
            console.error(`Failed to delete image from S3: ${error.message}`);
          }
        }
      }
    }

    // 새 이미지가 있을 경우 업로드
    const imageUrls = files ? await this.s3Service.uploadFiles(files) : [];

    // 게시글 업데이트
    const updatedPost = await this.postRepository.updatePost(id, {
      title,
      content,
      post_image: imageUrls,
    });

    await this.valkeyService.del(`posts:`);
    return updatedPost;
  }

  async deletePost(user_id: number, id: number) {
    await this.verifyMessage(id, user_id);
    await this.postRepository.deletePost(id);
    await this.valkeyService.del(`posts:`);
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
