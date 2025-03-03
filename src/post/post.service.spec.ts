import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { PostRepository } from './post.repository';
import { S3Service } from '../s3/s3.service';
import { ValkeyService } from '../valkey/valkey.service';
import { NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

describe('PostService', () => {
  let postService: PostService;

  const mockPosts = [
    {
      id: 1,
      title: 'Mock Post 1',
      content: 'This is the content of mock post 1',
    },
    {
      id: 2,
      title: 'Mock Post 2',
      content: 'This is the content of mock post 2',
    },
  ];

  const mockCachedPosts = [
    { id: 1, title: 'Cached Post 1', content: 'Cached Content 1' },
    { id: 2, title: 'Cached Post 2', content: 'Cached Content 2' },
  ];

  const mockImageUrls = ['url1', 'url2'];

  const mockPostRepository = {
    createPost: jest.fn(),
    findPosts: jest.fn(),
    findPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
  };

  const mockS3Service = {
    uploadFiles: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockValkeyService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: PostRepository, useValue: mockPostRepository },
        { provide: S3Service, useValue: mockS3Service },
        { provide: ValkeyService, useValue: mockValkeyService },
      ],
    }).compile();

    postService = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(postService).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const user_id = 1;
      const createPostDto: CreatePostDto = {
        title: 'Test Title',
        content: 'Test Content',
      };
      const files = [{ originalname: 'image1.png' }] as Express.Multer.File[];

      mockS3Service.uploadFiles.mockResolvedValue(mockImageUrls);
      mockPostRepository.createPost.mockResolvedValue({
        id: 1,
        ...createPostDto,
        post_image: mockImageUrls,
      });

      const result = await postService.createPost(
        user_id,
        createPostDto,
        files,
      );

      expect(result).toEqual({
        id: 1,
        ...createPostDto,
        post_image: mockImageUrls,
      });
      expect(mockS3Service.uploadFiles).toHaveBeenCalledWith(files);
      expect(mockPostRepository.createPost).toHaveBeenCalledWith(
        user_id,
        createPostDto.title,
        createPostDto.content,
        mockImageUrls,
      );
      expect(mockValkeyService.del).toHaveBeenCalledWith(`posts:`);
    });
  });

  describe('findPosts', () => {
    it('should return an array of posts from cache', async () => {
      mockValkeyService.get.mockResolvedValue(mockCachedPosts); // 캐시에서 데이터 반환

      const result = await postService.findPosts();

      expect(result).toEqual(mockCachedPosts);
      expect(mockPostRepository.findPosts).not.toHaveBeenCalled(); // 데이터베이스 호출이 없어야 함
    });

    it('should return an array of posts and cache them', async () => {
      mockValkeyService.get.mockResolvedValue(null); // 캐시에 데이터가 없음을 설정
      mockPostRepository.findPosts.mockResolvedValue(mockPosts); // 데이터베이스에서 데이터 반환

      const result = await postService.findPosts();

      expect(result).toEqual(mockPosts);
      expect(mockPostRepository.findPosts).toHaveBeenCalled(); // 데이터베이스 호출이 있어야 함
      expect(mockValkeyService.set).toHaveBeenCalledWith(
        `posts:`,
        mockPosts,
        60,
      ); // 캐시에 저장 확인
    });
  });

  describe('findPost', () => {
    it('should return a post by id from cache', async () => {
      const cachedPost = mockCachedPosts[0];
      mockValkeyService.get.mockResolvedValue(cachedPost); // 캐시에서 데이터 반환

      const result = await postService.findPost(1);

      expect(result).toEqual(cachedPost);
      expect(mockPostRepository.findPost).not.toHaveBeenCalled(); // 데이터베이스 호출이 없어야 함
    });

    it('should return a post by id and cache it', async () => {
      const post = mockPosts[0];
      mockValkeyService.get.mockResolvedValue(null); // 캐시에 데이터가 없음을 설정
      mockPostRepository.findPost.mockResolvedValue(post); // 데이터베이스에서 데이터 반환

      const result = await postService.findPost(1);

      expect(result).toEqual(post);
      expect(mockPostRepository.findPost).toHaveBeenCalledWith(1); // 데이터베이스 호출이 있어야 함
      expect(mockValkeyService.set).toHaveBeenCalledWith(`post:1`, post, 60); // 캐시에 저장 확인
    });

    it('should throw NotFoundException if post is not found', async () => {
      mockPostRepository.findPost.mockResolvedValue(null); // 게시물이 없음을 설정

      await expect(postService.findPost(999)).rejects.toThrow(
        NotFoundException,
      ); // 예외 발생 확인
    });
  });

  describe('updatePost', () => {
    it('should update an existing post', async () => {
      const user_id = 1;
      const id = 1;
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Title',
        content: 'Updated Content',
      };
      const files = [{ originalname: 'image1.png' }] as Express.Multer.File[];
      const existingPost = { user_id, post_image: ['oldImage.png'] };

      mockPostRepository.findPost.mockResolvedValue(existingPost);
      mockS3Service.uploadFiles.mockResolvedValue(['newImage.png']);
      mockPostRepository.updatePost.mockResolvedValue(undefined);
      mockS3Service.deleteFile.mockResolvedValue(undefined);

      await postService.updatePost(user_id, id, updatePostDto, files);

      expect(mockS3Service.deleteFile).toHaveBeenCalledWith('oldImage.png');
      expect(mockPostRepository.updatePost).toHaveBeenCalledWith(id, {
        title: updatePostDto.title,
        content: updatePostDto.content,
        post_image: ['newImage.png'],
      });
      expect(mockValkeyService.del).toHaveBeenCalledWith(`posts:`); // 캐시 삭제 확인
    });

    it('should throw NotFoundException if post is not found or unauthorized', async () => {
      const user_id = 1;
      const id = 999;

      mockPostRepository.findPost.mockResolvedValue(null); // 게시물이 없음을 설정

      await expect(
        postService.updatePost(user_id, id, {} as UpdatePostDto),
      ).rejects.toThrow(NotFoundException); // 예외 발생 확인
    });
  });

  describe('deletePost', () => {
    it('should delete an existing post', async () => {
      const user_id = 1;
      const id = 1;

      const existingPost = { user_id, post_image: ['image1.png'] };
      mockPostRepository.findPost.mockResolvedValue(existingPost);
      mockPostRepository.deletePost.mockResolvedValue(undefined);
      mockS3Service.deleteFile.mockResolvedValue(undefined);

      await postService.deletePost(user_id, id);

      expect(mockPostRepository.deletePost).toHaveBeenCalledWith(id);
      expect(mockValkeyService.del).toHaveBeenCalledWith(`posts:`); // 캐시 삭제 확인
    });

    it('should throw NotFoundException if post is not found or unauthorized', async () => {
      const user_id = 1;
      const id = 999;

      mockPostRepository.findPost.mockResolvedValue(null); // 게시물이 없음을 설정

      await expect(postService.deletePost(user_id, id)).rejects.toThrow(
        NotFoundException,
      ); // 예외 발생 확인
    });
  });
});
