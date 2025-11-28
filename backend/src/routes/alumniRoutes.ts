import { Router } from 'express';
import * as ctrl from '../controllers/alumniController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

router.post('/register', ctrl.register);
router.get('/', isAuthenticated, ctrl.list);

export default router;
