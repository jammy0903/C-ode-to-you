import { Router } from 'express';
import { ProblemsController } from './problems.controller';
import { validate } from '../../middleware/validation.middleware';
import { optionalAuthenticate } from '../../middleware/auth.middleware';
import {
  getProblemListSchema,
  searchProblemsSchema,
  getProblemDetailSchema,
} from './problems.validation';

const router = Router();
const controller = new ProblemsController();

// All routes have optional authentication to show user-specific data if logged in
router.use(optionalAuthenticate);

/**
 * GET /api/problems
 * Get paginated problem list
 */
router.get('/', validate(getProblemListSchema), controller.getProblemList);

/**
 * GET /api/problems/search
 * Search problems
 */
router.get('/search', validate(searchProblemsSchema), controller.searchProblems);

/**
 * GET /api/problems/stats
 * Get problem statistics
 */
router.get('/stats', controller.getProblemStats);

/**
 * GET /api/problems/:problemId
 * Get problem detail
 */
router.get('/:problemId', validate(getProblemDetailSchema), controller.getProblemDetail);

/**
 * GET /api/problems/:problemId/functions
 * Get recommended functions
 */
router.get('/:problemId/functions', validate(getProblemDetailSchema), controller.getRecommendedFunctions);

export default router;
