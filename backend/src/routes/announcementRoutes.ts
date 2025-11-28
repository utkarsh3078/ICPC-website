import { Router } from 'express';
import * as ctrl from '../controllers/announcementController';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = Router();

router.post('/', isAuthenticated, isAdmin, ctrl.create);
router.get('/', ctrl.listAll);

export default router;
