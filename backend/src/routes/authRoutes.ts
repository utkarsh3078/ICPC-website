import { Router } from 'express';
import * as auth from '../controllers/authController';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { body } from 'express-validator';

const router = Router();

router.post(
	'/register',
	[body('email').isEmail(), body('password').isLength({ min: 6 })],
	auth.register
);
router.post('/login', [body('email').isEmail(), body('password').exists()], auth.login);
router.post('/approve/:id', isAuthenticated, isAdmin, auth.approve);

export default router;
