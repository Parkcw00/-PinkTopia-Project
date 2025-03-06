import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtService } from '@nestjs/jwt';
import { UserGuard } from '../user/guards/user-guard';

const mockCommentService = {
  createComment: jest.fn().mockResolvedValue(undefined),
  findComments: jest
    .fn()
    .mockResolvedValue([{ id: 1, content: 'Test Comment' }]),
  updateComment: jest
    .fn()
    .mockResolvedValue({ id: 1, content: 'Updated Comment' }),
  deleteComment: jest.fn().mockResolvedValue(undefined),
};

describe('CommentController', () => {
  let commentController: CommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
        {
          provide: JwtService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(UserGuard) // 사용자 가드를 사용합니다.
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    commentController = module.get<CommentController>(CommentController);
  });

  it('should be defined', () => {
    expect(commentController).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      const createCommentDto: CreateCommentDto = { content: 'Test Comment' };
      const req = { user: { id: 1 } };
      const post_id = 1;

      await commentController.create(req, post_id, createCommentDto);
      expect(mockCommentService.createComment).toHaveBeenCalledWith(
        1,
        post_id,
        createCommentDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all comments for a post', async () => {
      const post_id = 1;
      const result = await commentController.findAll(post_id);
      expect(result).toEqual([{ id: 1, content: 'Test Comment' }]);
      expect(mockCommentService.findComments).toHaveBeenCalledWith(post_id);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const updateCommentDto: UpdateCommentDto = { content: 'Updated Comment' };
      const req = { user: { id: 1 } };
      const id = 1;

      const result = await commentController.update(req, id, updateCommentDto);
      expect(result).toEqual({ id: 1, content: 'Updated Comment' });
      expect(mockCommentService.updateComment).toHaveBeenCalledWith(
        1,
        id,
        updateCommentDto,
      );
    });
  });

  describe('remove', () => {
    it('should delete a comment', async () => {
      const req = { user: { id: 1 } };
      const id = 1;

      await commentController.remove(req, id);
      expect(mockCommentService.deleteComment).toHaveBeenCalledWith(1, id);
    });
  });
});
