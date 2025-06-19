# 📚 BookHub

A modern, full-stack book discovery and community platform built with React, Node.js, and TypeScript. BookHub allows users to explore books from the New York Times API, rate them, share comments, and engage with a community of book lovers.

![BookHub](https://img.shields.io/badge/BookHub-Community%20Platform-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript)

## ✨ Features

### Book Discovery

- **NYT Books Integration** - Browse books from New York Times bestseller lists
- **Advanced Search** - Search books by title, author, or publisher with debounced input
- **Beautiful Book Cards** - Modern, responsive design with hover effects
- **Detailed Book Information** - Comprehensive book details in elegant modals

### Rating System

- **Interactive Ratings** - Rate books with a 5-star system
- **Community Ratings** - View average ratings and total rating counts
- **Real-time Updates** - Ratings update instantly across the platform

### Community Features

- **Comments & Reviews** - Share your thoughts on books
- **User Authentication** - Secure login and registration system
- **Comment Management** - Edit and delete your own comments
- **Community Discussion** - Engage with other book lovers

### Modern UI/UX

- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Smooth Animations** - Elegant transitions and hover effects

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Form handling with validation
- **Yup** - Schema validation
- **Axios** - HTTP client
- **Lucide React** - Beautiful icons

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Sequelize** - ORM for database management
- **SQLite** - Lightweight database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server with auto-reload
- **ts-node** - TypeScript execution

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kennyure/BookHub.git
   cd book-hub
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**

   ```bash
   # In server directory, create .env file
   cd ../server
   cp .env.example .env
   ```

   Add your configuration:

   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_here
   NYT_API_KEY=your_nyt_api_key_here
   ```

5. **Start the development servers**

   **Terminal 1 - Start the backend:**

   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Start the frontend:**

   ```bash
   cd client
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
book-hub/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── books/      # Book-related components
│   │   │   ├── comments/   # Comment components
│   │   │   └── ratings/    # Rating components
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── middleware/         # Express middleware
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   │   ├── auth.ts         # Authentication routes
│   │   ├── books.ts        # Book routes
│   │   ├── comments.ts     # Comment routes
│   │   └── ratings.ts      # Rating routes
│   └── package.json
└── README.md
```

## 🔧 Available Scripts

### Server Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run format      # Format code with Prettier
```

### Client Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Books

- `GET /api/books` - Get all books from NYT API

### Ratings

- `POST /api/ratings` - Create or update rating
- `GET /api/ratings/:bookId` - Get ratings for a book
- `DELETE /api/ratings/:ratingId` - Delete rating

### Comments

- `POST /api/comments` - Create comment
- `GET /api/comments/:bookId` - Get comments for a book
- `PUT /api/comments/:commentId` - Update comment
- `DELETE /api/comments/:commentId` - Delete comment

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Registration** - Users can create new accounts
2. **Login** - Users authenticate with username/password
3. **Token Storage** - JWT tokens stored in localStorage
4. **Protected Routes** - API endpoints require valid tokens
