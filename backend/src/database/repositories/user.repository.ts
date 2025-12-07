/**
 * @file user.repository.ts
 * @description User data access layer (Repository pattern)
 *
 * @principles
 * - SRP: ✅ Data access only - no business logic
 * - Repository Pattern: Abstracts Prisma operations
 * - Upsert Pattern: OAuth user creation/update
 *
 * @functions (10 total)
 * - findById(id): Promise<User> - Get user by ID
 * - findByEmail(email): Promise<User> - Get user by email
 * - findByProvider(provider, providerId): Promise<User> - Get user by OAuth provider (unique constraint)
 * - create(data): Promise<User> - Create new user
 * - update(id, data): Promise<User> - Update user (email, name)
 * - upsert(data): Promise<User> - Create or update user (OAuth flow)
 * - getUserStatistics(userId): Promise<Statistics> - Complex problem-solving stats
 * - getUserActivity(userId, days): Promise<Activity[]> - Daily activity with problem list
 * - getUserSettings(userId): Promise<Settings> - JSON-based user preferences
 * - updateUserSettings(userId, settings): Promise<Settings> - Upsert settings with merge
 *
 * @complexity
 * - getUserStatistics: Most complex method (395 lines total, 133 lines implementation)
 *   - Uses Promise.all for 3 parallel queries (line 119)
 *   - Raw SQL for difficulty breakdown (lines 133-142)
 *   - Raw SQL for recent activity (lines 168-184)
 *   - Raw SQL for all submission dates (lines 193-199)
 *   - Custom streak calculation algorithm (lines 201-239)
 *   - Performance: O(n) where n = total submission days for user
 *
 * @streakAlgorithm (lines 201-239)
 * - Calculates currentStreak and longestStreak from submission dates
 * - Iterates through dates in DESC order
 * - Logic: Check day difference between consecutive dates
 *   - diffDays === 1: Increment streak
 *   - diffDays > 1: Reset streak
 * - Current streak: Only counts if latest submission is today or yesterday
 * - Longest streak: Maximum consecutive days ever achieved
 *
 * @settingsManagement (lines 295-393)
 * - JSON fields: editorSettings, aiSettings, githubSettings, notificationSettings
 * - Default values returned if no settings exist
 * - Partial updates: Merges new settings with existing (spread operator)
 * - Upsert pattern: Creates if not exists, updates if exists
 *
 * @rawSqlQueries (3 queries)
 * 1. Difficulty breakdown (lines 133-142): GROUP BY with accepted verdicts
 * 2. Recent activity (lines 168-184): Daily aggregation with JSON_AGG for problem numbers
 * 3. Submission dates (lines 193-199): DISTINCT dates for streak calculation
 *
 * @duplicateLogic
 * - ✅ No duplication - complex but well-structured
 */

import { prisma } from '../../config/database';
import { Provider } from '@prisma/client';

export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by provider and provider ID
   */
  async findByProvider(provider: Provider, providerId: string) {
    return prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider,
          providerId,
        },
      },
    });
  }

  /**
   * Create new user
   */
  async create(data: {
    email: string;
    name: string;
    provider: Provider;
    providerId: string;
  }) {
    return prisma.user.create({
      data,
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: { email?: string; name?: string }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Create or update user (upsert)
   */
  async upsert(data: {
    provider: Provider;
    providerId: string;
    email: string;
    name: string;
  }) {
    return prisma.user.upsert({
      where: {
        provider_providerId: {
          provider: data.provider,
          providerId: data.providerId,
        },
      },
      update: {
        email: data.email,
        name: data.name,
      },
      create: data,
    });
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId: string) {
    // Get total solved and attempts
    const [solvedResult, totalAttempts, byDifficulty] = await Promise.all([
      // Count distinct problems with accepted verdict
      prisma.submission.groupBy({
        by: ['problemId'],
        where: {
          userId,
          verdict: 'accepted',
        },
      }),
      // Count total submissions
      prisma.submission.count({
        where: { userId },
      }),
      // Count by difficulty
      prisma.$queryRaw<
        Array<{ difficulty: string; count: bigint }>
      >`
        SELECT p.difficulty, COUNT(DISTINCT s.problem_id) as count
        FROM submissions s
        JOIN problems p ON s.problem_id = p.id
        WHERE s.user_id = ${userId}::uuid
          AND s.verdict = 'accepted'
        GROUP BY p.difficulty
      `,
    ]);

    const totalSolved = solvedResult.length;
    const successRate = totalAttempts > 0 ? (totalSolved / totalAttempts) * 100 : 0;

    // Parse difficulty counts (group by Baekjoon tier family: bronze/silver/gold/...)
    const difficultyMap: Record<string, number> = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
      diamond: 0,
      ruby: 0,
    };
    byDifficulty.forEach((row) => {
      const [tierGroup] = row.difficulty.split('_'); // e.g. 'silver_5' -> 'silver'
      if (tierGroup in difficultyMap) {
        difficultyMap[tierGroup] += Number(row.count);
      }
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSubmissions = await prisma.$queryRaw<
      Array<{
        date: Date;
        solved: bigint;
        attempted: bigint;
      }>
    >`
      SELECT
        DATE(submitted_at) as date,
        COUNT(DISTINCT CASE WHEN verdict = 'accepted' THEN problem_id END) as solved,
        COUNT(DISTINCT problem_id) as attempted
      FROM submissions
      WHERE user_id = ${userId}::uuid
        AND submitted_at >= ${sevenDaysAgo}
      GROUP BY DATE(submitted_at)
      ORDER BY date DESC
    `;

    const recentActivity = recentSubmissions.map((row) => ({
      date: row.date.toISOString().split('T')[0],
      solved: Number(row.solved),
      attempted: Number(row.attempted),
    }));

    // Calculate streaks
    const allDates = await prisma.$queryRaw<Array<{ date: Date }>>`
      SELECT DISTINCT DATE(submitted_at) as date
      FROM submissions
      WHERE user_id = ${userId}::uuid
        AND verdict = 'accepted'
      ORDER BY date DESC
    `;

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let previousDate: Date | null = null;

    for (const { date } of allDates) {
      if (!previousDate) {
        tempStreak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const submissionDate = new Date(date);
        submissionDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
          (today.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays <= 1) {
          currentStreak = 1;
        }
      } else {
        const prevDate = new Date(previousDate);
        const currDate = new Date(date);
        const diffDays = Math.floor(
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          tempStreak++;
          if (currentStreak > 0) currentStreak++;
        } else {
          tempStreak = 1;
          currentStreak = 0;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
      previousDate = date;
    }

    return {
      totalSolved,
      totalAttempts,
      successRate: Math.round(successRate * 10) / 10,
      byDifficulty: difficultyMap,
      currentStreak,
      longestStreak,
      recentActivity,
    };
  }

  /**
   * Get user activity for specified days
   */
  async getUserActivity(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activityData = await prisma.$queryRaw<
      Array<{
        date: Date;
        submissions: bigint;
        solved: bigint;
        problems: unknown;
      }>
    >`
      SELECT
        DATE(submitted_at) as date,
        COUNT(*) as submissions,
        COUNT(DISTINCT CASE WHEN verdict = 'accepted' THEN problem_id END) as solved,
        JSON_AGG(DISTINCT (SELECT number FROM problems WHERE id = submissions.problem_id)) as problems
      FROM submissions
      WHERE user_id = ${userId}::uuid
        AND submitted_at >= ${startDate}
      GROUP BY DATE(submitted_at)
      ORDER BY date DESC
    `;

    return activityData.map((row) => {
      const problemsArray = row.problems as number[];
      return {
        date: row.date.toISOString().split('T')[0],
        submissions: Number(row.submissions),
        solved: Number(row.solved),
        problems: Array.isArray(problemsArray)
          ? problemsArray.filter((n) => n !== null)
          : [],
      };
    });
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId: string) {
    const settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Return default settings
      return {
        editor: {
          fontSize: 14,
          theme: 'dark' as const,
          tabSize: 2,
        },
        ai: {
          hintLevel: 'beginner' as const,
        },
        github: {
          autoCommit: true,
        },
        notifications: {
          email: true,
          push: false,
        },
      };
    }

    return {
      editor: settings.editorSettings as {
        fontSize: number;
        theme: 'light' | 'dark';
        tabSize: number;
      },
      ai: settings.aiSettings as {
        hintLevel: 'beginner' | 'intermediate' | 'advanced';
      },
      github: settings.githubSettings as {
        autoCommit: boolean;
      },
      notifications: settings.notificationSettings as {
        email: boolean;
        push: boolean;
      },
    };
  }

  /**
   * Update user settings
   */
  async updateUserSettings(
    userId: string,
    settings: {
      editor?: Record<string, unknown>;
      ai?: Record<string, unknown>;
      github?: Record<string, unknown>;
      notifications?: Record<string, unknown>;
    }
  ) {
    // Get current settings
    const currentSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    const editorSettings = {
      ...(currentSettings?.editorSettings as Record<string, unknown> || {}),
      ...(settings.editor || {}),
    };

    const aiSettings = {
      ...(currentSettings?.aiSettings as Record<string, unknown> || {}),
      ...(settings.ai || {}),
    };

    const githubSettings = {
      ...(currentSettings?.githubSettings as Record<string, unknown> || {}),
      ...(settings.github || {}),
    };

    const notificationSettings = {
      ...(currentSettings?.notificationSettings as Record<string, unknown> || {}),
      ...(settings.notifications || {}),
    };

    return prisma.userSettings.upsert({
      where: { userId },
      update: {
        editorSettings,
        aiSettings,
        githubSettings,
        notificationSettings,
      },
      create: {
        userId,
        editorSettings,
        aiSettings,
        githubSettings,
        notificationSettings,
      },
    });
  }
}
