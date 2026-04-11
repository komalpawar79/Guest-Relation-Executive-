import { asyncHandler, ErrorHandler } from '../utils/errorHandler.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const register = asyncHandler(async (req, res, next) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return next(new ErrorHandler('Please provide all required fields', 400));
  }

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler('User already exists', 400));
  }

  user = await User.create({
    email,
    password,
    name,
    role: role || 'gre',
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorHandler('Invalid credentials', 401));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorHandler('Invalid credentials', 401));
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
  });
});

export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});
