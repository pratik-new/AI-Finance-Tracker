import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  monthlyBudget: {
    type: Number,
    required: [true, 'Please provide a monthly budget'],
    min: [0, 'Budget cannot be negative']
  },
  categoryBudgets: [
    {
      category: {
        type: String,
        required: true
      },
      limit: {
        type: Number,
        required: true,
        min: [0, 'Limit cannot be negative']
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

budgetSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);