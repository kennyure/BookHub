import { Router, Request, Response } from 'express';
import Rating from '../models/Rating';
import User from '../models/User';
import auth from '../middleware/auth';

const router = Router();

// Validation helper functions
const validateBookId = (bookId: string): boolean => {
  return Boolean(
    bookId && typeof bookId === 'string' && bookId.trim().length > 0,
  );
};

const validateRating = (rating: number): boolean => {
  return (
    typeof rating === 'number' &&
    rating >= 1 &&
    rating <= 5 &&
    Number.isInteger(rating)
  );
};

const validateRatingId = (ratingId: string): boolean => {
  return Boolean(ratingId && !isNaN(Number(ratingId)) && Number(ratingId) > 0);
};

// Create or update rating
router.post('/', auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId, rating }: { bookId: string; rating: number } = req.body;
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

    if (rating === undefined || rating === null) {
      res.status(400).json({
        message: 'rating is required',
        error: 'MISSING_RATING',
      });
      return;
    }

    if (!validateRating(rating)) {
      res.status(400).json({
        message: 'Rating must be an integer between 1 and 5',
        error: 'INVALID_RATING',
      });
      return;
    }

    const [existingRating, created] = await Rating.findOrCreate({
      where: { bookId, userId },
      defaults: { bookId, userId, rating },
    });

    if (!created) {
      existingRating.rating = rating;
      await existingRating.save();
    }

    // Return rating with user info
    const ratingWithUser = await Rating.findByPk(existingRating.id, {
      include: [{ model: User, attributes: ['username'] }],
    });

    res.json(ratingWithUser);
  } catch (err) {
    console.error('Create/update rating error:', err);
    res.status(500).json({
      message: 'Error creating/updating rating',
      error: (err as Error).message,
    });
  }
});

// Get rating for a book
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

    const ratings = await Rating.findAll({
      where: { bookId },
      include: [{ model: User, attributes: ['username'] }],
    });

    const averageRating =
      ratings.length > 0
        ? Math.round(
          (ratings.reduce((acc, curr) => acc + curr.rating, 0) /
              ratings.length) *
              10,
        ) / 10
        : 0;

    res.json({
      averageRating,
      totalRatings: ratings.length,
      ratings,
    });
  } catch (err) {
    console.error('Get ratings error:', err);
    res.status(500).json({
      message: 'Error fetching ratings',
      error: (err as Error).message,
    });
  }
});

// Get all ratings (optional - for admin purposes)
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

    const { count, rows: ratings } = await Rating.findAndCountAll({
      where: whereClause,
      include: [{ model: User, attributes: ['username'] }],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
    });

    res.json(ratings);
  } catch (err) {
    console.error('Get all ratings error:', err);
    res.status(500).json({
      message: 'Error fetching ratings',
      error: (err as Error).message,
    });
  }
});

// Delete rating
router.delete(
  '/:ratingId',
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { ratingId } = req.params;

      // Validation checks
      if (!validateRatingId(ratingId)) {
        res.status(400).json({
          message: 'Invalid ratingId format',
          error: 'INVALID_RATING_ID',
        });
        return;
      }

      await Rating.destroy({
        where: { id: ratingId },
      });

      res.json({ message: 'Rating deleted successfully' });
    } catch (err) {
      console.error('Delete rating error:', err);
      res.status(500).json({
        message: 'Error deleting rating',
        error: (err as Error).message,
      });
    }
  },
);

export default router;
