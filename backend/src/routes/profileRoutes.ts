import { Router } from 'express';
import * as ctrl from '../controllers/profileController';
import { isAuthenticated } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

router.post(
	'/',
	isAuthenticated,
	[body('name').isString().optional(), body('branch').isString().optional(), body('year').isInt().optional(), body('contact').isString().optional()],
	ctrl.upsert
);
router.get('/', isAuthenticated, ctrl.get);

export default router;
