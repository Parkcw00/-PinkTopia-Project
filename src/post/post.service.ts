import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { PostRepository } from './post.repository';
import * as AWS from 'aws-sdk';
import { awsConfig } from '../../aws.config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PostService {
  private s3: AWS.S3;
  constructor(private readonly postRepository: PostRepository) {
    this.s3 = new AWS.S3({
      region: process.env.AWS_REGION || 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_KEY || '',
      },
    });
  }

  async createPost(
    user_id: number,
    createPostDto: CreatePostDto,
    files: Express.Multer.File[], // 여러 파일을 받도록 수정
  ) {
    const { title, content } = createPostDto;
    const imageUrls: string[] = [];

    // 모든 파일을 S3에 업로드
    for (const file of files) {
      const uniqueFileName = `${uuidv4()}-${file.originalname}`;
      const params = {
        Bucket: awsConfig.bucketName || '',
        Key: uniqueFileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      const uploadResult = await this.s3.upload(params).promise();
      imageUrls.push(uploadResult.Location); // 이미지 URL을 배열에 추가
    }

    return await this.postRepository.createPost(
      user_id,
      title,
      content,
      imageUrls,
    );
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
    files?: Express.Multer.File[], // 파일을 선택적으로 받도록 수정
  ): Promise<void> {
    const { title, content } = updatePostDto;
    await this.verifyMessage(id, user_id);

    // 기존 게시글 가져오기
    const post = await this.postRepository.findPost(id);
    if (post) {
      // 기존 이미지 삭제
      for (const imageUrl of post.post_image) {
        const key = imageUrl.split('/').pop(); // S3 URL에서 파일 이름 추출
        if (key) {
          try {
            await this.s3
              .deleteObject({
                Bucket: awsConfig.bucketName || '',
                Key: key,
              })
              .promise();
          } catch (error) {
            console.error(`Failed to delete image from S3: ${error.message}`);
          }
        }
      }
    }

    // 새 이미지가 있을 경우 업로드
    const imageUrls: string[] = [];
    if (files) {
      for (const file of files) {
        const uniqueFileName = `${uuidv4()}-${file.originalname}`;
        const params = {
          Bucket: awsConfig.bucketName || '',
          Key: uniqueFileName,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        };

        const uploadResult = await this.s3.upload(params).promise();
        imageUrls.push(uploadResult.Location); // 새 이미지 URL을 배열에 추가
      }
    }

    // 게시글 업데이트
    await this.postRepository.updatePost(id, {
      title,
      content,
      post_image: imageUrls,
    });
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
