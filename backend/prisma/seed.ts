import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample problems
  const problem1000 = await prisma.problem.create({
    data: {
      number: 1000,
      title: 'A+B',
      description: '두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.',
      inputFormat: '첫째 줄에 A와 B가 주어진다. (0 < A, B < 10)',
      outputFormat: '첫째 줄에 A+B를 출력한다.',
      difficulty: 'silver_5',
      tags: ['math', 'implementation'],
      timeLimit: 2000,
      memoryLimit: 128,
      examples: [
        {
          input: '1 2',
          output: '3',
          explanation: '1 + 2 = 3'
        }
      ],
      functions: {
        create: [
          {
            category: 'input_output',
            functionName: 'scanf',
            headerFile: 'stdio.h',
            description: '표준 입력으로부터 데이터를 읽어옵니다.',
            example: 'int a, b;\nscanf("%d %d", &a, &b);',
            displayOrder: 1
          },
          {
            category: 'input_output',
            functionName: 'printf',
            headerFile: 'stdio.h',
            description: '표준 출력으로 데이터를 출력합니다.',
            example: 'printf("%d\\n", a + b);',
            displayOrder: 2
          }
        ]
      }
    }
  });

  const problem1001 = await prisma.problem.create({
    data: {
      number: 1001,
      title: 'A-B',
      description: '두 정수 A와 B를 입력받은 다음, A-B를 출력하는 프로그램을 작성하시오.',
      inputFormat: '첫째 줄에 A와 B가 주어진다. (0 < A, B < 10)',
      outputFormat: '첫째 줄에 A-B를 출력한다.',
      difficulty: 'silver_5',
      tags: ['math', 'implementation'],
      timeLimit: 2000,
      memoryLimit: 128,
      examples: [
        {
          input: '3 2',
          output: '1',
          explanation: '3 - 2 = 1'
        }
      ],
      functions: {
        create: [
          {
            category: 'input_output',
            functionName: 'scanf',
            headerFile: 'stdio.h',
            description: '표준 입력으로부터 데이터를 읽어옵니다.',
            example: 'int a, b;\nscanf("%d %d", &a, &b);',
            displayOrder: 1
          },
          {
            category: 'input_output',
            functionName: 'printf',
            headerFile: 'stdio.h',
            description: '표준 출력으로 데이터를 출력합니다.',
            example: 'printf("%d\\n", a - b);',
            displayOrder: 2
          }
        ]
      }
    }
  });

  const problem10950 = await prisma.problem.create({
    data: {
      number: 10950,
      title: 'A+B - 3',
      description: '두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.',
      inputFormat:
        '첫째 줄에 테스트 케이스의 개수 T가 주어진다.\n각 테스트 케이스는 한 줄로 이루어져 있으며, 각 줄에 A와 B가 주어진다. (0 < A, B < 10)',
      outputFormat: '각 테스트 케이스마다 A+B를 출력한다.',
      difficulty: 'silver_5',
      tags: ['math', 'implementation', 'loop'],
      timeLimit: 2000,
      memoryLimit: 128,
      examples: [
        {
          input: '5\n1 1\n2 3\n3 4\n9 8\n5 2',
          output: '2\n5\n7\n17\n7',
          explanation: '테스트 케이스가 5개 주어지고, 각각의 합을 출력합니다.'
        }
      ],
      functions: {
        create: [
          {
            category: 'input_output',
            functionName: 'scanf',
            headerFile: 'stdio.h',
            description: '표준 입력으로부터 데이터를 읽어옵니다.',
            example: 'int t, a, b;\nscanf("%d", &t);\nscanf("%d %d", &a, &b);',
            displayOrder: 1
          },
          {
            category: 'input_output',
            functionName: 'printf',
            headerFile: 'stdio.h',
            description: '표준 출력으로 데이터를 출력합니다.',
            example: 'printf("%d\\n", a + b);',
            displayOrder: 2
          },
          {
            category: 'control_flow',
            functionName: 'for loop',
            headerFile: null,
            description: '반복문을 사용하여 여러 테스트 케이스를 처리합니다.',
            example: 'for (int i = 0; i < t; i++) {\n    // process each case\n}',
            displayOrder: 3
          }
        ]
      }
    }
  });

  console.log('✅ Created problems:', {
    problem1000: problem1000.id,
    problem1001: problem1001.id,
    problem10950: problem10950.id
  });

  console.log('✨ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
