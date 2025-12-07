/**
 * @file crawl-solvedac-problems.ts
 * @description Crawl problems from solved.ac API and save to database
 *
 * @usage
 * npm run dev
 * tsx scripts/crawl-solvedac-problems.ts
 *
 * @target
 * Bronze 5 ~ Silver 3 problems (초급자 대상)
 * 각 티어당 2페이지 (80문제) × 8티어 = 640문제 예상
 */

import { PrismaClient } from '@prisma/client';
import { SolvedacService } from '../src/modules/problems/solvedac.service';
import { solvedacRateLimiter } from '../src/utils/rate-limiter';
import logger from '../src/utils/logger';

const prisma = new PrismaClient();
const solvedac = new SolvedacService();

/**
 * Main crawling function
 */
async function crawlProblems() {
  console.log('🚀 Starting problem crawling from solved.ac...\n');

  // 수집할 난이도 범위 (Bronze 5 ~ Silver 3)
  const tiers = ['b5', 'b4', 'b3', 'b2', 'b1', 's5', 's4', 's3'];
  const pagesPerTier = 2; // 각 티어당 2페이지 (페이지당 40문제)

  let totalAdded = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const tier of tiers) {
    console.log(`\n📥 Crawling tier: ${tier.toUpperCase()}`);
    console.log('─'.repeat(50));

    let tierAdded = 0;
    let tierSkipped = 0;

    for (let page = 1; page <= pagesPerTier; page++) {
      try {
        // Rate limiter: 자동으로 대기
        await solvedacRateLimiter.waitIfNeeded();

        // 문제 검색
        const searchResult = await solvedac.getProblemsByTier(tier, page);

        console.log(`  📄 Page ${page}/${pagesPerTier}: ${searchResult.items.length} problems found`);

        for (const item of searchResult.items) {
          try {
            // 1. 중복 체크
            const existing = await prisma.problem.findUnique({
              where: { number: item.problemId },
            });

            if (existing) {
              console.log(`    ⏭️  #${item.problemId} already exists: ${item.titleKo}`);
              tierSkipped++;
              totalSkipped++;
              continue;
            }

            // 2. Rate limiter (상세 정보 조회 시)
            await solvedacRateLimiter.waitIfNeeded();

            // 3. 문제 상세 정보 조회
            const detail = await solvedac.getProblem(item.problemId);

            // 4. DB에 저장
            await prisma.problem.create({
              data: {
                number: detail.problemId,
                title: detail.titleKo || detail.titles[0]?.title || `Problem ${detail.problemId}`,
                description: `이 문제는 백준 온라인 저지에서 확인하세요.\n\n난이도: ${SolvedacService.levelToTier(detail.level)}\n평균 시도 횟수: ${detail.averageTries.toFixed(1)}회`,
                inputFormat: '입력 형식은 백준에서 확인하세요.',
                outputFormat: '출력 형식은 백준에서 확인하세요.',
                difficulty: SolvedacService.levelToTier(detail.level),
                solvedacLevel: detail.level,
                baekjoonUrl: SolvedacService.getBaekjoonUrl(detail.problemId),
                tags: detail.tags.map((tag) => tag.key),
                timeLimit: 2000, // 기본값
                memoryLimit: 128, // 기본값
                examples: [], // 예제는 수동으로 추가
                acceptedCount: detail.acceptedUserCount,
                submissionCount: 0, // 초기값
              },
            });

            console.log(`    ✅ #${detail.problemId}: ${detail.titleKo}`);
            tierAdded++;
            totalAdded++;

            // 부하 분산을 위한 추가 딜레이 (선택적)
            await sleep(100); // 100ms
          } catch (error: any) {
            console.error(`    ❌ Error processing problem ${item.problemId}:`, error.message);
            totalErrors++;
          }
        }

        // 페이지 간 딜레이
        await sleep(500);
      } catch (error: any) {
        console.error(`  ❌ Error fetching page ${page} for tier ${tier}:`, error.message);
        totalErrors++;
      }
    }

    console.log(`  ✨ Tier ${tier.toUpperCase()} completed: ${tierAdded} added, ${tierSkipped} skipped`);
  }

  // 최종 통계
  console.log('\n' + '='.repeat(50));
  console.log('🎉 Crawling completed!');
  console.log('='.repeat(50));
  console.log(`📊 Statistics:`);
  console.log(`  ✅ Total added: ${totalAdded} problems`);
  console.log(`  ⏭️  Total skipped: ${totalSkipped} problems`);
  console.log(`  ❌ Total errors: ${totalErrors} problems`);
  console.log(`  📈 Success rate: ${((totalAdded / (totalAdded + totalErrors)) * 100).toFixed(1)}%`);

  // Rate limiter 통계
  const rateLimiterStats = solvedacRateLimiter.getStats();
  console.log(`\n⏱️  Rate Limiter Stats:`);
  console.log(`  Requests in window: ${rateLimiterStats.requestsInWindow}/${rateLimiterStats.limit}`);
  console.log(`  Utilization: ${rateLimiterStats.utilizationPercent}%`);
  console.log(`  Remaining: ${rateLimiterStats.remaining} requests`);
}

/**
 * Utility: Sleep function
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main execution
 */
async function main() {
  try {
    await crawlProblems();
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

export { crawlProblems };
