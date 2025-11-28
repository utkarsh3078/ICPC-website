import { Router } from 'express';
import { chatRoute } from '../controllers/aiController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

router.post('/chat', isAuthenticated, chatRoute);

export default router;
