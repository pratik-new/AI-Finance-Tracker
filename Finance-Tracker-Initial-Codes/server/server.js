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

// ✅ FIXED CORS (PRODUCTION SAFE)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(helmet());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ROOT ROUTE (FIX FOR "Cannot GET /")
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Finance Tracker API is running'
  });
});

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

app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});
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

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;