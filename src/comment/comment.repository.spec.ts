import { Test, TestingModule } from '@nestjs/testing';
import { CommentRepository } from './comment.repository';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CommentRepository', () => {
  let commentRepository: CommentRepository;
  let mockCommentRepository: Repository<Comment>;

  const mockComment = {
    id: 1,
    post_id: 1,
    user_id: 1,
    content: 'Test comment',
  };

  const mockComments = [mockComment];

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockComment),
    save: jest.fn().mockResolvedValue(mockComment),
    find: jest.fn().mockResolvedValue(mockComments),
    findOne: jest.fn().mockResolvedValue(mockComment),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentRepository,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockRepository,
        },
      ],
    }).compile();

    commentRepository = module.get<CommentRepository>(CommentRepository);
    mockCommentRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );
  });

  it('should be defined', () => {
    expect(commentRepository).toBeDefined();
  });

  describe('createComment', () => {
    it('should create and save a new comment', async () => {
      const post_id = 1;
      const user_id = 1;
      const content = 'Test comment';

      const result = await commentRepository.createComment(
        post_id,
        user_id,
        content,
      );

      expect(mockRepository.create).toHaveBeenCalledWith({
        post_id,
        user_id,
        content,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockComment);
      expect(result).toEqual(mockComment);
    });
  });

  describe('findComments', () => {
    it('should return an array of comments for a given post_id', async () => {
      const post_id = 1;

      const result = await commentRepository.findComments(post_id);

      expect(mockRepository.find).toHaveBeenCalledWith({ where: { post_id } });
      expect(result).toEqual(mockComments);
    });
  });

  describe('findComment', () => {
    it('should return a comment by id', async () => {
      const id = 1;

      const result = await commentRepository.findComment(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual(mockComment);
    });

    it('should return null if comment does not exist', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null); // 댓글이 없을 때

      const result = await commentRepository.findComment(999);

      expect(result).toBeNull();
    });
  });

  describe('updateComment', () => {
    it('should update the comment', async () => {
      const id = 1;
      const updateData = { content: 'Updated comment' };

      await commentRepository.updateComment(id, updateData);

      expect(mockRepository.update).toHaveBeenCalledWith({ id }, updateData);
    });
  });

  describe('deleteComment', () => {
    it('should delete the comment', async () => {
      const id = 1;

      await commentRepository.deleteComment(id);

      expect(mockRepository.delete).toHaveBeenCalledWith({ id });
    });
  });
});
