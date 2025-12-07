import { Router } from 'express';
import { GitHubController } from './github.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  connectGitHubSchema,
  createCommitSchema,
  syncHistorySchema,
} from './github.validation';

const router = Router();
const githubController = new GitHubController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/github/connect
 * @desc    Connect GitHub account
 * @access  Private
 */
router.post(
  '/connect',
  validate(connectGitHubSchema),
  githubController.connectGitHub
);

/**
 * @route   GET /api/github/status
 * @desc    Get GitHub connection status
 * @access  Private
 */
router.get('/status', githubController.getStatus);

/**
 * @route   DELETE /api/github/disconnect
 * @desc    Disconnect GitHub account
 * @access  Private
 */
router.delete('/disconnect', githubController.disconnectGitHub);

/**
 * @route   POST /api/github/commit
 * @desc    Create commit with solution
 * @access  Private
 */
router.post(
  '/commit',
  validate(createCommitSchema),
  githubController.createCommit
);

/**
 * @route   POST /api/github/sync
 * @desc    Sync submission history to GitHub
 * @access  Private
 */
router.post(
  '/sync',
  validate(syncHistorySchema),
  githubController.syncHistory
);

export default router;
