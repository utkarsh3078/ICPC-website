import { Router } from 'express';
import * as ctrl from '../controllers/sessionController';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

router.post('/', isAuthenticated, isAdmin, [body('title').isString().notEmpty()], ctrl.create);
router.put('/:id', isAuthenticated, isAdmin, ctrl.update);
router.delete('/:id', isAuthenticated, isAdmin, ctrl.remove);
router.get('/', ctrl.listAll);
router.post('/:id/register', isAuthenticated, ctrl.register);
router.post('/:id/attendance', isAuthenticated, isAdmin, [body('userId').isString().notEmpty(), body('present').isBoolean()], ctrl.attendance);

export default router;
