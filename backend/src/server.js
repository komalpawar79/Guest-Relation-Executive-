import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import connectDB from './config/db.js';
import { errorMiddleware } from './utils/errorHandler.js';

// Route imports
import clientRoutes from './routes/clientRoutes.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import excelRoutes from './routes/excelRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

dotenv.config();

// Define allowed origins for CORS (handles both dev and production)
const allowedOrigins = [
  'http://localhost:5173',      // Development frontend
  'http://localhost:5000',      // Development backend (for Socket.IO)
  'https://gre-woad.vercel.app', // Production frontend
  'https://gre-bxnz.onrender.com', // Production backend
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: corsOptions,
});

// Connect to MongoDB
await connectDB();

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'GRE Dashboard Backend is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/attendance', attendanceRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use(errorMiddleware);

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
