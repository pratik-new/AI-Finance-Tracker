import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please select a category']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'upi', 'wallet', 'other'],
    default: 'card'
  },
  description: {
    type: String,
    trim: true
  },
  transactionDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

transactionSchema.index({ userId: 1, transactionDate: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, category: 1 });

export default mongoose.model('Transaction', transactionSchema);