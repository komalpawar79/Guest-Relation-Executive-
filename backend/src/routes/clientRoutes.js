import express from 'express';
import {
  addClient,
  getClients,
  getClient,
  updateClient,
  updateRemark,
  markAttended,
  deleteClient,
} from '../controllers/clientController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/', addClient);
router.get('/', getClients);
router.get('/:id', getClient);
router.put('/:id', updateClient);
router.put('/:id/remark', updateRemark);
router.put('/:id/attendance', markAttended);
router.delete('/:id', deleteClient);

export default router;
