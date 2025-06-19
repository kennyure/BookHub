import { Router, Request, Response } from 'express';
import Comment from '../models/Comment';
import User from '../models/User';
import auth from '../middleware/auth';

const router = Router();

// Validation helper functions
const validateBookId = (bookId: string): boolean => {
  return Boolean(
    bookId && typeof bookId === 'string' && bookId.trim().length > 0,
  );
};

const validateContent = (content: string): boolean => {
  return Boolean(
    content &&
      typeof content === 'string' &&
      content.trim().length >= 1 &&
      content.trim().length <= 1000,
  );
};

const validateCommentId = (commentId: string): boolean => {
  return Boolean(
    commentId && !isNaN(Number(commentId)) && Number(commentId) > 0,
  );
};

// Create comment
router.post('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId, content }: { bookId: string; content: string } = req.body;
    const userId = req.user!.userId;

    // Validation checks
    if (!bookId) {
      res.status(400).json({
        message: 'bookId is required',
        error: 'MISSING_BOOK_ID',
      });
      return;
    }

    if (!validateBookId(bookId)) {
      res.status(400).json({
        message: 'Invalid bookId format',
        error: 'INVALID_BOOK_ID',
      });
      return;
    }

    if (!content) {
      res.status(400).json({
        message: 'content is required',
        error: 'MISSING_CONTENT',
      });
      return;
    }

    if (!validateContent(content)) {
      res.status(400).json({
        message: 'Content must be between 1 and 1000 characters',
        error: 'INVALID_CONTENT_LENGTH',
      });
      return;
    }

    const comment = await Comment.create({
      bookId,
      userId,
      content: content.trim(),
    });

    // Return comment with user info
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['username'] }],
    });

    res.status(201).json(commentWithUser);
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({
      message: 'Error creating comment',
      error: (err as Error).message,
    });
  }
});

// Get comments for a book
router.get('/:bookId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId } = req.params;

    // Validation checks
    if (!validateBookId(bookId)) {
      res.status(400).json({
        message: 'Invalid bookId format',
        error: 'INVALID_BOOK_ID',
      });
      return;
    }

    const comments = await Comment.findAll({
      where: { bookId },
      include: [{ model: User, attributes: ['username'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json(comments);
  } catch (err) {
    console.error('Get comments error:', err);
    res.status(500).json({
      message: 'Error fetching comments',
      error: (err as Error).message,
    });
  }
});

// Get all comments (optional - for admin purposes)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, bookId } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    // Validation checks
    if (isNaN(pageNum) || pageNum < 1) {
      res.status(400).json({
        message: 'Page must be a positive number',
        error: 'INVALID_PAGE',
      });
      return;
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(400).json({
        message: 'Limit must be between 1 and 100',
        error: 'INVALID_LIMIT',
      });
      return;
    }

    const whereClause: any = {};
    if (bookId && validateBookId(bookId as string)) {
      whereClause.bookId = bookId;
    }

    const offset = (pageNum - 1) * limitNum;

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: whereClause,
      include: [{ model: User, attributes: ['username'] }],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    res.json(comments);
  } catch (err) {
    console.error('Get all comments error:', err);
    res.status(500).json({
      message: 'Error fetching comments',
      error: (err as Error).message,
    });
  }
});

// Update comment
router.put(
  '/:commentId',
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { commentId } = req.params;
      const { content }: { content: string } = req.body;
      const userId = req.user!.userId;

      // Validation checks
      if (!validateCommentId(commentId)) {
        res.status(400).json({
          message: 'Invalid commentId format',
          error: 'INVALID_COMMENT_ID',
        });
        return;
      }

      if (!content) {
        res.status(400).json({
          message: 'content is required',
          error: 'MISSING_CONTENT',
        });
        return;
      }

      if (!validateContent(content)) {
        res.status(400).json({
          message: 'Content must be between 1 and 1000 characters',
          error: 'INVALID_CONTENT_LENGTH',
        });
        return;
      }

      const comment = await Comment.findOne({
        where: { id: commentId, userId },
        include: [{ model: User, attributes: ['username'] }],
      });

      if (!comment) {
        res.status(404).json({
          message: 'Comment not found or you don\'t have permission to edit it',
          error: 'COMMENT_NOT_FOUND',
        });
        return;
      }

      comment.content = content.trim();
      await comment.save();

      res.json(comment);
    } catch (err) {
      console.error('Update comment error:', err);
      res.status(500).json({
        message: 'Error updating comment',
        error: (err as Error).message,
      });
    }
  },
);

// Delete comment
router.delete(
  '/:commentId',
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { commentId } = req.params;
      const userId = req.user!.userId;

      // Validation checks
      if (!validateCommentId(commentId)) {
        res.status(400).json({
          message: 'Invalid commentId format',
          error: 'INVALID_COMMENT_ID',
        });
        return;
      }

      const deletedCount = await Comment.destroy({
        where: { id: commentId, userId },
      });

      if (deletedCount === 0) {
        res.status(404).json({
          message:
            'Comment not found or you don\'t have permission to delete it',
          error: 'COMMENT_NOT_FOUND',
        });
        return;
      }

      res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
      console.error('Delete comment error:', err);
      res.status(500).json({
        message: 'Error deleting comment',
        error: (err as Error).message,
      });
    }
  },
);

export default router;
