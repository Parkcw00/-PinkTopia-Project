import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ValkeyService } from '../valkey/valkey.service';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';

class MockUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.user = { id: 1 };
    return true;
  }
}

const mockPostService = {
  createPost: jest.fn().mockResolvedValue(undefined),
  findPosts: jest
    .fn()
    .mockResolvedValue([{ title: 'Test Post', content: 'Test Content' }]),
  findPost: jest
    .fn()
    .mockResolvedValue({ title: 'Test Post', content: 'Test Content' }),
  updatePost: jest
    .fn()
    .mockResolvedValue({ title: 'Updated Post', content: 'Updated Content' }),
  deletePost: jest.fn().mockResolvedValue(undefined),
};

const mockUserService = {
  findUserById: jest.fn().mockResolvedValue({ id: 1 }),
};

const mockUserRepository = {};

describe('PostController', () => {
  let postController: PostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        {
          provide: PostService,
          useValue: mockPostService,
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: ValkeyService,
          useValue: {},
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    })
      .overrideGuard(MockUserGuard) // 가짜 유저 가드를 사용합니다.
      .useValue(new MockUserGuard())
      .compile();

    postController = module.get<PostController>(PostController);
  });

  it('should be defined', () => {
    expect(postController).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Post',
        content: 'Test Content',
      };
      await postController.createPost({ user: { id: 1 } }, createPostDto, []);
      expect(mockPostService.createPost).toHaveBeenCalledWith(
        1,
        createPostDto,
        [],
      );
    });
  });

  describe('findPosts', () => {
    it('should return all posts', async () => {
      const result = await postController.findPosts();
      expect(result).toEqual([{ title: 'Test Post', content: 'Test Content' }]);
      expect(mockPostService.findPosts).toHaveBeenCalled();
    });
  });

  describe('findPost', () => {
    it('should return a post by id', async () => {
      const result = await postController.findPost(1);
      expect(result).toEqual({ title: 'Test Post', content: 'Test Content' });
      expect(mockPostService.findPost).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const updatePostDto: UpdatePostDto = {
        title: 'Updated Post',
        content: 'Updated Content',
      };
      const result = await postController.update(
        { user: { id: 1 } },
        1,
        updatePostDto,
        [],
      );
      expect(result).toEqual({
        title: 'Updated Post',
        content: 'Updated Content',
      });
      expect(mockPostService.updatePost).toHaveBeenCalledWith(
        1,
        1,
        updatePostDto,
        [],
      );
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      await postController.remove({ user: { id: 1 } }, 1);
      expect(mockPostService.deletePost).toHaveBeenCalledWith(1, 1);
    });
  });
});
