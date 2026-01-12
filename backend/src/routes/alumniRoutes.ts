import { Router } from 'express';
import * as ctrl from '../controllers/alumniController';
import { isAuthenticated, isAlumni } from '../middleware/auth';

const router = Router();

// Public - register as alumni (requires admin approval)
router.post('/register', ctrl.register);

// Authenticated - list all approved alumni
router.get('/', isAuthenticated, ctrl.list);

// Alumni only - get all students with ranks
router.get('/students', isAuthenticated, isAlumni, ctrl.getStudents);

export default router;
