import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== REGISTER REQUEST DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Body type:', typeof req.body);
    console.log('Body keys:', Object.keys(req.body || {}));

    const { username, password } = req.body;
    console.log('Extracted username:', username);
    console.log('Extracted password:', password);
    console.log('Username type:', typeof username);
    console.log('Password type:', typeof password);

    // Validate input
    if (!username || !password) {
      console.log('Validation failed: missing username or password');
      res.status(400).json({
        message: 'Username and password are required',
        received: { username: !!username, password: !!password },
        body: req.body,
      });
      return;
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      console.log('Validation failed: wrong types');
      res.status(400).json({
        message: 'Username and password must be strings',
        received: { username: typeof username, password: typeof password },
        body: req.body,
      });
      return;
    }

    if (username.trim().length === 0 || password.trim().length === 0) {
      console.log('Validation failed: empty strings');
      res.status(400).json({ message: 'Username and password cannot be empty' });
      return;
    }

    console.log(
      'About to check for existing user with username:',
      username.trim(),
    );

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { username: username.trim() },
    });
    if (existingUser) {
      console.log('User already exists');
      res.status(400).json({ message: 'Username already exists' });
      return;
    }

    console.log('About to create user with username:', username.trim());

    // Create new user
    const user = await User.create({
      username: username.trim(),
      password: password.trim(),
    });

    console.log('User created successfully:', user.id);

    // Create token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' },
    );

    res.status(201).json({ token });
  } catch (err) {
    console.error('Registration error:', err);
    console.error('Error stack:', (err as Error).stack);
    res
      .status(500)
      .json({ message: 'Error creating user', error: (err as Error).message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({ message: 'Username and password are required' });
      return;
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({ message: 'Username and password must be strings' });
      return;
    }

    // Find user
    const user = await User.findOne({ where: { username: username.trim() } });
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid password' });
      return;
    }

    // Create token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' },
    );

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res
      .status(500)
      .json({ message: 'Error logging in', error: (err as Error).message });
  }
});

export default router;
