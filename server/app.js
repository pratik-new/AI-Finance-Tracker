import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();

const app = express();

// ✅ FIXED: allow correct frontend port
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5174',
  'http://127.0.0.1:5174'
];

// Middleware
app.use(helmet());

app.use(cors({
  origin: function (origin, callback) {
    // allow tools like Postman
    if (!origin) return callback(null, true);

    return callback(null, true); // ✅ allow ALL origins in dev
  },
  credentials: true
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB
export const connectDB = async () => {
  try {
    console.log("MongoDB URI loaded");

    await mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-finance-tracker'
);

    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong'
  });
});

export default app;