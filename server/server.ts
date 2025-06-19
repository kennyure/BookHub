import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import sequelize from './config/database';

dotenv.config();

const app = express();

// Middleware - order matters!
app.use(cors());

// Body parsing middleware - make sure this comes before routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(
    `${req.method} ${req.path} - Content-Type: ${req.headers['content-type']}`,
  );
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Import models
import User from './models/User';
import Rating from './models/Rating';
import Comment from './models/Comment';

// Import routes
import booksRouter from './routes/books';
import authRouter from './routes/auth';
import ratingsRouter from './routes/ratings';
import commentsRouter from './routes/comments';

// Database initialization
async function initializeDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync all models with database
    await sequelize.sync({ force: false }); // Set force: true to recreate tables
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit if database connection fails
  }
}

// Routes
app.use('/api/books', booksRouter);
app.use('/api/auth', authRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/comments', commentsRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
async function startServer(): Promise<void> {
  try {
    // Initialize database first
    await initializeDatabase();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
