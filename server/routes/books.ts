import { Router, Request, Response } from 'express';
import axios from 'axios';

// Define the book interface with unique identifier
interface Book {
  author: string
  book_image: string
  book_image_height: number
  book_image_width: number
  contributor: string
  created_date: string
  description: string
  price: string
  publisher: string
  title: string
  list_name?: string
  list_display_name?: string
  // Add unique identifier
  bookId?: string
}

const router = Router();

// Get all books from overview endpoint (single API call)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!process.env.NYT_API_KEY) {
      res.status(500).json({ message: 'NYT API key is not configured' });
      return;
    }

    console.log('=== FETCHING ALL BOOKS FROM OVERVIEW ===');

    // Single API call to get overview with all books
    const overviewResponse = await axios.get(
      `https://api.nytimes.com/svc/books/v3/lists/overview.json?api-key=${process.env.NYT_API_KEY}`,
    );

    const allBooks: Book[] = [];
    const lists = overviewResponse.data.results?.lists || [];

    console.log(`Found ${lists.length} lists in overview`);

    // Extract books from each list in the overview
    for (const list of lists) {
      if (list.books && Array.isArray(list.books)) {
        const booksWithList = list.books.map((book: any) => ({
          author: book.author,
          book_image: book.book_image,
          book_image_height: book.book_image_height,
          book_image_width: book.book_image_width,
          contributor: book.contributor,
          created_date: book.created_date,
          description: book.description,
          price: book.price,
          publisher: book.publisher,
          title: book.title,
          list_name: list.list_name_encoded,
          list_display_name: list.list_name,
          bookId: book.primary_isbn13,
        }));

        allBooks.push(...booksWithList);
        console.log(
          `Added ${booksWithList.length} books from ${list.list_name}`,
        );
      }
    }

    console.log(`Total books fetched: ${allBooks.length}`);

    // Sort books by title for better organization
    allBooks.sort((a, b) => a.title.localeCompare(b.title));

    // Return unified response
    res.json(allBooks);
  } catch (err) {
    console.error('Books fetch error:', err);

    if (axios.isAxiosError(err)) {
      if (err.response?.status === 401) {
        res.status(500).json({
          message: 'NYT API authentication failed. Please check your API key.',
          error: 'Invalid or missing NYT API key',
        });
      } else {
        res.status(500).json({
          message: 'Error fetching books',
          error: `NYT API error: ${err.response?.status} - ${err.response?.statusText}`,
        });
      }
    } else {
      res.status(500).json({
        message: 'Error fetching books',
        error: (err as Error).message,
      });
    }
  }
});

export default router;
