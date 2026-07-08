import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMonthlyReport } from '../controllers/reportController.js';

const router = express.Router();

router.use(protect);
router.get('/monthly', getMonthlyReport);

export default router;
