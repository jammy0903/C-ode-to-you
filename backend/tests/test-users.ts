import { prisma } from '../src/config/database';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

async function testUsers() {
  console.log('================================');
  console.log('Testing User Module');
  console.log('================================\n');

  try {
    // Get existing test user from previous submission tests
    console.log('1. Getting test user...');
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' },
    });

    if (!user) {
      throw new Error('Test user not found. Please run submission tests first.');
    }

    console.log(`User found: ${user.id}\n`);

    // Generate JWT token
    console.log('2. Generating JWT token...');
    const token = jwt.sign(
      { userId: user.id, type: 'access' } as object,
      env.JWT_SECRET,
      { expiresIn: '1h' } as jwt.SignOptions
    );
    console.log('Token generated\n');

    const BASE_URL = 'http://localhost:3000/api/users';

    // Test 1: Get user statistics
    console.log('3. Testing GET /api/users/me/stats...');
    const statsResponse = await fetch(`${BASE_URL}/me/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const statsData = await statsResponse.json();
    console.log('Statistics:', JSON.stringify(statsData, null, 2));
    console.log('');

    // Test 2: Get user activity (last 7 days)
    console.log('4. Testing GET /api/users/me/activity (default 7 days)...');
    const activityResponse = await fetch(`${BASE_URL}/me/activity`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const activityData = await activityResponse.json();
    console.log('Activity:', JSON.stringify(activityData, null, 2));
    console.log('');

    // Test 3: Get user activity (last 30 days)
    console.log('5. Testing GET /api/users/me/activity?days=30...');
    const activity30Response = await fetch(`${BASE_URL}/me/activity?days=30`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const activity30Data = await activity30Response.json();
    console.log('Activity (30 days):', JSON.stringify(activity30Data, null, 2));
    console.log('');

    // Test 4: Get user settings (should return defaults)
    console.log('6. Testing GET /api/users/me/settings...');
    const settingsResponse = await fetch(`${BASE_URL}/me/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const settingsData = await settingsResponse.json();
    console.log('Settings:', JSON.stringify(settingsData, null, 2));
    console.log('');

    // Test 5: Update user settings
    console.log('7. Testing PUT /api/users/me/settings...');
    const updateResponse = await fetch(`${BASE_URL}/me/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        editor: {
          fontSize: 16,
          theme: 'light',
        },
        ai: {
          hintLevel: 'intermediate',
        },
        github: {
          autoCommit: false,
        },
        notifications: {
          email: false,
          push: true,
        },
      }),
    });

    const updateData = await updateResponse.json();
    console.log('Update result:', JSON.stringify(updateData, null, 2));
    console.log('');

    // Test 6: Get updated settings
    console.log('8. Testing GET /api/users/me/settings (after update)...');
    const updatedSettingsResponse = await fetch(`${BASE_URL}/me/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const updatedSettingsData = await updatedSettingsResponse.json();
    console.log('Updated settings:', JSON.stringify(updatedSettingsData, null, 2));
    console.log('');

    // Test 7: Partial update
    console.log('9. Testing PUT /api/users/me/settings (partial update)...');
    const partialUpdateResponse = await fetch(`${BASE_URL}/me/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        editor: {
          fontSize: 18,
        },
      }),
    });

    const partialUpdateData = await partialUpdateResponse.json();
    console.log('Partial update result:', JSON.stringify(partialUpdateData, null, 2));
    console.log('');

    // Test 8: Verify partial update
    console.log('10. Testing GET /api/users/me/settings (after partial update)...');
    const finalSettingsResponse = await fetch(`${BASE_URL}/me/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const finalSettingsData = await finalSettingsResponse.json();
    console.log('Final settings:', JSON.stringify(finalSettingsData, null, 2));
    console.log('');

    console.log('================================');
    console.log('All user tests completed!');
    console.log('================================');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUsers();
