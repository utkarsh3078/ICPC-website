import { Router } from 'express';
import * as ctrl from '../controllers/taskController';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

router.post('/', isAuthenticated, isAdmin, [body('title').isString().notEmpty()], ctrl.create);
router.post('/:taskId/assign', isAuthenticated, isAdmin, [body('userId').isString().notEmpty()], ctrl.assign);
router.post('/:taskId/submit', isAuthenticated, [body('link').isURL().optional()], ctrl.submit);

export default router;
