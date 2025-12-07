import { prisma } from './src/config/database';
import jwt from 'jsonwebtoken';
import { env } from './src/config/env';

async function testSubmissions() {
  console.log('================================');
  console.log('Testing Submission Module');
  console.log('================================\n');

  try {
    // 1. Create test user
    console.log('1. Creating test user...');
    const user = await prisma.user.upsert({
      where: {
        provider_providerId: {
          provider: 'google',
          providerId: 'test123',
        },
      },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        provider: 'google',
        providerId: 'test123',
      },
    });
    console.log(`User created: ${user.id}\n`);

    // 2. Get problem 1000 (A+B)
    console.log('2. Getting problem 1000 (A+B)...');
    const problem = await prisma.problem.findFirst({
      where: { number: 1000 },
    });
    if (!problem) {
      throw new Error('Problem 1000 not found');
    }
    console.log(`Problem ID: ${problem.id}\n`);

    // 3. Generate JWT token
    console.log('3. Generating JWT token...');
    const token = jwt.sign(
      { userId: user.id, type: 'access' } as object,
      env.JWT_SECRET,
      { expiresIn: '1h' } as jwt.SignOptions
    );
    console.log('Token generated\n');

    const BASE_URL = 'http://localhost:3000/api';

    // Test 1: Submit correct code
    console.log('4. Testing correct code submission...');
    const correctCode = `#include <stdio.h>
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\\n", a + b);
    return 0;
}`;

    const submitResponse = await fetch(`${BASE_URL}/submissions/${problem.id}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: correctCode, language: 'c' }),
    });

    const submitData = await submitResponse.json();
    console.log('Submission result:', JSON.stringify(submitData, null, 2));
    const submissionId = submitData.data?.id;
    console.log('');

    // Test 2: Get submission status
    if (submissionId) {
      console.log('5. Getting submission status...');
      const statusResponse = await fetch(`${BASE_URL}/submissions/${submissionId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const statusData = await statusResponse.json();
      console.log('Status:', JSON.stringify(statusData, null, 2));
      console.log('');
    }

    // Test 3: Submit wrong code
    console.log('6. Testing wrong code submission...');
    const wrongCode = `#include <stdio.h>
int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\\n", a - b);
    return 0;
}`;

    const wrongResponse = await fetch(`${BASE_URL}/submissions/${problem.id}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: wrongCode, language: 'c' }),
    });

    const wrongData = await wrongResponse.json();
    console.log('Wrong submission result:', JSON.stringify(wrongData, null, 2));
    console.log('');

    // Test 4: Get last submission
    console.log('7. Getting last submission...');
    const lastResponse = await fetch(`${BASE_URL}/submissions/${problem.id}/my-last`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const lastData = await lastResponse.json();
    console.log('Last submission:', JSON.stringify(lastData, null, 2));
    console.log('');

    // Test 5: Save draft
    console.log('8. Saving draft code...');
    const draftCode = `#include <stdio.h>
int main() {
    // Work in progress
    return 0;
}`;

    const draftResponse = await fetch(`${BASE_URL}/submissions/${problem.id}/draft`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: draftCode }),
    });

    const draftData = await draftResponse.json();
    console.log('Draft saved:', JSON.stringify(draftData, null, 2));
    console.log('');

    // Test 6: Get draft
    console.log('9. Getting draft code...');
    const getDraftResponse = await fetch(`${BASE_URL}/submissions/${problem.id}/draft`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    const getDraftData = await getDraftResponse.json();
    console.log('Draft:', JSON.stringify(getDraftData, null, 2));
    console.log('');

    // Test 7: Validate code (should pass)
    console.log('10. Validating correct code...');
    const validateResponse = await fetch(`${BASE_URL}/submissions/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: correctCode }),
    });

    const validateData = await validateResponse.json();
    console.log('Validation result:', JSON.stringify(validateData, null, 2));
    console.log('');

    // Test 8: Validate invalid code
    console.log('11. Validating invalid code...');
    const invalidCode = `#include <stdio.h>
int main() {
    printf("missing semicolon")
    return 0;
}`;

    const invalidResponse = await fetch(`${BASE_URL}/submissions/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: invalidCode }),
    });

    const invalidData = await invalidResponse.json();
    console.log('Invalid validation result:', JSON.stringify(invalidData, null, 2));
    console.log('');

    console.log('================================');
    console.log('All tests completed!');
    console.log('================================');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSubmissions();
