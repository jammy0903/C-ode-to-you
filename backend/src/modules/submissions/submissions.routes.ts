import { Router } from 'express';
import { SubmissionController } from './submissions.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { submissionLimiter } from '../../middleware/rate-limit.middleware';
import {
  submitCodeSchema,
  getSubmissionStatusSchema,
  saveDraftSchema,
  getSubmissionHistorySchema,
} from './submissions.validation';

const router = Router();
const submissionController = new SubmissionController();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/submissions/:problemId/submit
 * @desc    Submit code for judging
 * @access  Private
 */
router.post(
  '/:problemId/submit',
  submissionLimiter,
  validate(submitCodeSchema),
  submissionController.submitCode
);

/**
 * @route   GET /api/submissions/:submissionId/status
 * @desc    Get submission status and result
 * @access  Private
 */
router.get(
  '/:submissionId/status',
  validate(getSubmissionStatusSchema),
  submissionController.getSubmissionStatus
);

/**
 * @route   GET /api/submissions/:problemId/my-last
 * @desc    Get user's last submission for a problem
 * @access  Private
 */
router.get('/:problemId/my-last', submissionController.getLastSubmission);

/**
 * @route   GET /api/submissions/:problemId/attempts
 * @desc    Get all user's attempts for a problem
 * @access  Private
 */
router.get('/:problemId/attempts', submissionController.getUserAttempts);

/**
 * @route   POST /api/submissions/:problemId/draft
 * @desc    Save draft code
 * @access  Private
 */
router.post(
  '/:problemId/draft',
  validate(saveDraftSchema),
  submissionController.saveDraft
);

/**
 * @route   GET /api/submissions/:problemId/draft
 * @desc    Get draft code
 * @access  Private
 */
router.get('/:problemId/draft', submissionController.getDraft);

/**
 * @route   GET /api/submissions/wrong
 * @desc    Get user's wrong submissions list
 * @access  Private
 */
router.get(
  '/wrong',
  validate(getSubmissionHistorySchema),
  submissionController.getWrongSubmissions
);

/**
 * @route   GET /api/submissions/history
 * @desc    Get user's submission history
 * @access  Private
 */
router.get(
  '/history',
  validate(getSubmissionHistorySchema),
  submissionController.getSubmissionHistory
);

/**
 * @route   POST /api/submissions/validate
 * @desc    Quick validation - check if code compiles
 * @access  Private
 */
router.post('/validate', submissionController.validateCode);

export default router;
