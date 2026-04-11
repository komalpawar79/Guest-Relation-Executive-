import express from 'express';
import {
  getDailyReport,
  getMonthlyReport,
  getYearlyReport,
  getManagerAnalytics,
  getAnalytics,
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);
router.get('/yearly', getYearlyReport);
router.get('/manager-analytics', getManagerAnalytics);
router.get('/analytics', getAnalytics);

export default router;
