import { Router } from 'express';
import * as ctrl from '../controllers/blogController';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

router.post('/', isAuthenticated, [body('title').isString().notEmpty(), body('content').isString().notEmpty()], ctrl.create);
router.get('/pending', isAuthenticated, isAdmin, ctrl.listPending);
router.post('/approve/:id', isAuthenticated, isAdmin, ctrl.approve);
router.post('/:id/comments', isAuthenticated, [body('comment').isString().notEmpty()], ctrl.comment);
router.post('/:id/comments/approve/:commentId', isAuthenticated, isAdmin, ctrl.approveComment);

export default router;
