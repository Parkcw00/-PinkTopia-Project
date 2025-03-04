import { Test, TestingModule } from '@nestjs/testing';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';
import { PostRepository } from '../post/post.repository';
import { ValkeyService } from '../valkey/valkey.service';
import { NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentService', () => {
  let commentService: CommentService;

  const mockPost = { id: 1, title: 'Mock Post' };

  const mockCommentRepository = {
    createComment: jest.fn(),
    findComments: jest.fn(),
    findComment: jest.fn(),
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
  };

  const mockPostRepository = {
    findPost: jest.fn(),
  };

  const mockValkeyService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        { provide: CommentRepository, useValue: mockCommentRepository },
        { provide: PostRepository, useValue: mockPostRepository },
        { provide: ValkeyService, useValue: mockValkeyService },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
  });

  it('should be defined', () => {
    expect(commentService).toBeDefined();
  });

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const user_id = 1;
      const post_id = 1;
      const createCommentDto: CreateCommentDto = {
        content: 'This is a comment',
      };

      mockPostRepository.findPost.mockResolvedValue(mockPost);
      mockCommentRepository.createComment.mockResolvedValue({
        id: 1,
        ...createCommentDto,
      });

      const result = await commentService.createComment(
        user_id,
        post_id,
        createCommentDto,
      );

      expect(result).toEqual({
        id: 1,
        ...createCommentDto,
      });
      expect(mockValkeyService.del).toHaveBeenCalledWith(`comments:${post_id}`);
    });

    it('should throw NotFoundException if post does not exist', async () => {
      const user_id = 1;
      const post_id = 999;
      const createCommentDto: CreateCommentDto = {
        content: 'This is a comment',
      };

      mockPostRepository.findPost.mockResolvedValue(null); // 게시물이 없음을 설정

      await expect(
        commentService.createComment(user_id, post_id, createCommentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findComments', () => {
    it('should return comments for a post from cache', async () => {
      const post_id = 1;
      const cachedComments = [{ id: 1, content: 'Cached Comment 1' }];

      mockPostRepository.findPost.mockResolvedValue(mockPost); // 게시물 존재 확인
      mockValkeyService.get.mockResolvedValue(cachedComments); // 캐시에서 데이터 반환

      const result = await commentService.findComments(post_id);

      expect(result).toEqual(cachedComments);
      expect(mockPostRepository.findPost).toHaveBeenCalled();
    });

    it('should return comments for a post and cache them', async () => {
      const post_id = 1;
      const comments = [{ id: 1, content: 'Comment 1' }];

      mockPostRepository.findPost.mockResolvedValue(mockPost); // 게시물 존재 확인
      mockValkeyService.get.mockResolvedValue(null); // 캐시에 데이터가 없음을 설정
      mockCommentRepository.findComments.mockResolvedValue(comments); // 데이터베이스에서 데이터 반환
      mockValkeyService.set.mockResolvedValue(true); // 캐시에 저장 성공

      const result = await commentService.findComments(post_id);

      expect(result).toEqual(comments);
      expect(mockPostRepository.findPost).toHaveBeenCalled(); // 데이터베이스 호출이 있어야 함
      expect(mockValkeyService.set).toHaveBeenCalledWith(
        `comments:${post_id}`,
        comments,
        60,
      ); // 캐시에 저장 확인
    });

    it('should throw NotFoundException if post does not exist', async () => {
      const post_id = 999;

      mockPostRepository.findPost.mockResolvedValue(null); // 게시물이 없음을 설정

      await expect(commentService.findComments(post_id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateComment', () => {
    it('should update an existing comment', async () => {
      const user_id = 1;
      const id = 1;
      const updateCommentDto: UpdateCommentDto = {
        content: 'Updated comment',
      };
      const comment = { id, user_id, post_id: 1, content: 'Old comment' };

      mockCommentRepository.findComment.mockResolvedValue(comment);
      mockCommentRepository.updateComment.mockResolvedValue(undefined);
      mockValkeyService.del.mockResolvedValue(undefined);

      await commentService.updateComment(user_id, id, updateCommentDto);

      expect(mockCommentRepository.updateComment).toHaveBeenCalledWith(id, {
        content: updateCommentDto.content,
      });
      expect(mockValkeyService.del).toHaveBeenCalledWith(
        `comments:${comment.post_id}`,
      );
    });

    it('should throw NotFoundException if comment does not exist or user is unauthorized', async () => {
      const user_id = 1;
      const id = 999;

      mockCommentRepository.findComment.mockResolvedValue(null); // 댓글이 없음을 설정

      await expect(
        commentService.updateComment(user_id, id, {} as UpdateCommentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteComment', () => {
    it('should delete an existing comment', async () => {
      const user_id = 1;
      const id = 1;
      const comment = { id, user_id, post_id: 1 };

      mockCommentRepository.findComment.mockResolvedValue(comment);
      mockCommentRepository.deleteComment.mockResolvedValue(undefined);
      mockValkeyService.del.mockResolvedValue(undefined);

      await commentService.deleteComment(user_id, id);

      expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith(id);
      expect(mockValkeyService.del).toHaveBeenCalledWith(
        `comments:${comment.post_id}`,
      );
    });

    it('should throw NotFoundException if comment does not exist or user is unauthorized', async () => {
      const user_id = 1;
      const id = 999;

      mockCommentRepository.findComment.mockResolvedValue(null); // 댓글이 없음을 설정

      await expect(commentService.deleteComment(user_id, id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
