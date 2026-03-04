import { Router } from 'express';
import verifyToken from '../middleware/auth';
import { getTransaction, createTransaction, deleteTransaction, getSummary, getMonthlySummary, getCategoryBreakdown } from '../controllers/transactionController';


const router = Router();

router.get('/summary', verifyToken, getSummary);
router.get('/monthly', verifyToken, getMonthlySummary);
router.get('/categories', verifyToken, getCategoryBreakdown);

router.get('/', verifyToken, getTransaction);
router.post('/', verifyToken, createTransaction);
router.delete('/:id', verifyToken, deleteTransaction);

export default router;