import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';

const router = express.Router();

router.use(protect);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;