import { Router } from 'express';
import * as ctrl from '../controllers/gamificationController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

router.get('/leaderboard', ctrl.leaderboard);
router.get('/badges', ctrl.badges);
router.get('/my-badges', isAuthenticated, ctrl.userBadges);

export default router;
