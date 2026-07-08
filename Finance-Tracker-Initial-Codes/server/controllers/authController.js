import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import { summarizeTransactions } from '../services/financeAnalyzer.js';

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email
});

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and email'
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail, _id: { $ne: req.userId } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name: name.trim(), email: normalizedEmail, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(user),
      data: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current password and a new password of at least 6 characters'
      });
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getAccountStats = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    const budget = await Budget.findOne({ userId: req.userId });
    const summary = summarizeTransactions(transactions, budget);

    res.status(200).json({
      success: true,
      data: {
        transactionCount: transactions.length,
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        savings: summary.savings,
        budgetRemaining: summary.budgetRemaining
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};