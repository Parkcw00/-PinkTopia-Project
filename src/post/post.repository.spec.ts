import { Test, TestingModule } from '@nestjs/testing';
import { PostRepository } from './post.repository';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';

describe('PostRepository', () => {
  let postRepository: PostRepository;

  const mockPostRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostRepository,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    postRepository = module.get<PostRepository>(PostRepository);
  });

  it('should be defined', () => {
    expect(postRepository).toBeDefined();
  });

  describe('createPost', () => {
    it('should create and save a new post', async () => {
      const user_id = 1;
      const title = 'Test Title';
      const content = 'Test Content';
      const post_image = ['image1.png', 'image2.png'];

      const newPost = { user_id, title, content, post_image };
      mockPostRepository.create.mockReturnValue(newPost);
      mockPostRepository.save.mockResolvedValue(newPost);

      const result = await postRepository.createPost(
        user_id,
        title,
        content,
        post_image,
      );

      expect(result).toEqual(newPost);
      expect(mockPostRepository.create).toHaveBeenCalledWith(newPost);
      expect(mockPostRepository.save).toHaveBeenCalledWith(newPost);
    });
  });

  describe('findPosts', () => {
    it('should return an array of posts', async () => {
      const result = [{ id: 1, title: 'Test Title', content: 'Test Content' }];
      mockPostRepository.find.mockResolvedValue(result);

      expect(await postRepository.findPosts()).toEqual(result);
      expect(mockPostRepository.find).toHaveBeenCalled();
    });
  });

  describe('findPost', () => {
    it('should return a post by id', async () => {
      const result = { id: 1, title: 'Test Title', content: 'Test Content' };
      mockPostRepository.findOne.mockResolvedValue(result);

      expect(await postRepository.findPost(1)).toEqual(result);
      expect(mockPostRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null if post is not found', async () => {
      mockPostRepository.findOne.mockResolvedValue(null);

      expect(await postRepository.findPost(999)).toBeNull();
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const updateData = { title: 'Updated Title' };

      await postRepository.updatePost(1, updateData);
      expect(mockPostRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        updateData,
      );
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      await postRepository.deletePost(1);
      expect(mockPostRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
