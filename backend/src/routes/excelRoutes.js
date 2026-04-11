import express from 'express';
import { exportClients } from '../controllers/excelController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/export', exportClients);

export default router;
