import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rate-limit.middleware';

// Create Express app
const app: Application = express();

// Trust proxy (for ngrok, load balancers, etc.)
app.set('trust proxy', 1);

// ============================================
// Middleware
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', generalLimiter);

// Request logging (development only)
if (env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// Routes
// ============================================

// Root endpoint - API Info
app.get('/', (_req, res) => {
  res.json({
    name: 'C Language Learning App API',
    version: '1.0.0',
    description: 'Backend API for mobile C language learning application',
    endpoints: {
      health: '/health',
      auth: {
        kakaoLogin: 'POST /api/auth/kakao',
        googleLogin: 'POST /api/auth/google',
        refresh: 'POST /api/auth/refresh',
        profile: 'GET /api/auth/profile',
      },
      problems: {
        list: 'GET /api/problems',
        detail: 'GET /api/problems/:id',
        search: 'GET /api/problems/search',
        stats: 'GET /api/problems/stats',
        functions: 'GET /api/problems/:id/functions',
      },
      submissions: {
        submit: 'POST /api/submissions/:problemId/submit',
        status: 'GET /api/submissions/:submissionId/status',
        myLast: 'GET /api/submissions/:problemId/my-last',
        attempts: 'GET /api/submissions/:problemId/attempts',
        draft: 'POST /api/submissions/:problemId/draft',
        getDraft: 'GET /api/submissions/:problemId/draft',
        wrong: 'GET /api/submissions/wrong',
        history: 'GET /api/submissions/history',
        validate: 'POST /api/submissions/validate',
      },
      users: {
        stats: 'GET /api/users/me/stats',
        activity: 'GET /api/users/me/activity',
        settings: 'GET /api/users/me/settings',
        updateSettings: 'PUT /api/users/me/settings',
      },
      ai: {
        chatHistory: 'GET /api/ai/chat/:problemId/history',
        sendMessage: 'POST /api/ai/chat/:problemId',
        codeReview: 'POST /api/ai/review/:problemId',
      },
      github: {
        connect: 'POST /api/github/connect',
        status: 'GET /api/github/status',
        disconnect: 'DELETE /api/github/disconnect',
        commit: 'POST /api/github/commit',
        sync: 'POST /api/github/sync',
      },
    },
    documentation: 'See /docs/api-spec.md for detailed API documentation',
  });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
import authRoutes from './modules/auth/auth.routes';
import problemRoutes from './modules/problems/problems.routes';
import submissionRoutes from './modules/submissions/submissions.routes';
import userRoutes from './modules/users/users.routes';
import aiRoutes from './modules/ai/ai.routes';
import githubRoutes from './modules/github/github.routes';

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/github', githubRoutes);

// ============================================
// Error Handlers
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
