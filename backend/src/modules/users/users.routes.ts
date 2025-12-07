import { Router } from 'express';
import { UserController } from './users.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { getUserActivitySchema, updateSettingsSchema } from './users.validation';

const router = Router();
const userController = new UserController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users/me/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/me/stats', userController.getUserStatistics);

/**
 * @route   GET /api/users/me/activity
 * @desc    Get user activity
 * @access  Private
 */
router.get('/me/activity', validate(getUserActivitySchema), userController.getUserActivity);

/**
 * @route   GET /api/users/me/settings
 * @desc    Get user settings
 * @access  Private
 */
router.get('/me/settings', userController.getUserSettings);

/**
 * @route   PUT /api/users/me/settings
 * @desc    Update user settings
 * @access  Private
 */
router.put(
  '/me/settings',
  validate(updateSettingsSchema),
  userController.updateUserSettings
);

export default router;
