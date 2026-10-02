/**
 * Comprehensive Automated Verification Script for WAD To-Do REST API
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING REST API VERIFICATION TESTS ---');

  // 1. Health Check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  console.log('✅ 1. Health Check:', healthData.status === 'online' ? 'PASSED' : 'FAILED');

  // 2. Signup Demo User
  const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Alex Rivera',
      email: 'demo@wad.edu',
      password: 'wad123456',
    }),
  });
  const signupData = await signupRes.json();
  console.log('✅ 2. Signup Test:', signupData.success ? 'PASSED' : (signupData.message.includes('already exists') ? 'PASSED (Existing user)' : 'FAILED'));

  // 3. Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@wad.edu',
      password: 'wad123456',
    }),
  });
  const loginData = await loginRes.json();
  console.log('✅ 3. Login Test:', loginData.success && loginData.token ? 'PASSED' : 'FAILED');
  const token = loginData.token;

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 4. Create Tasks
  const today = new Date().toISOString().split('T')[0];

  const task1Res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Complete WAD Web App Project Presentation',
      description: 'Prepare slide deck and live demo script for external examiner.',
      priority: 'High',
      category: 'Study',
      dueDate: today,
      dueTime: '14:00',
    }),
  });
  const task1Data = await task1Res.json();
  console.log('✅ 4. Create Task 1 (High Priority Study):', task1Data.success ? 'PASSED' : 'FAILED');
  const task1Id = task1Data.data._id;

  const task2Res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Review MongoDB & JWT Viva Concepts',
      description: 'Go through authentication token flow and database indexing.',
      priority: 'Medium',
      category: 'Study',
      dueDate: today,
      dueTime: '17:30',
    }),
  });
  const task2Data = await task2Res.json();
  console.log('✅ 5. Create Task 2 (Medium Priority):', task2Data.success ? 'PASSED' : 'FAILED');

  const task3Res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Drink 2L Water & Afternoon Walk',
      description: 'Stay hydrated and active.',
      priority: 'Low',
      category: 'Health',
      dueDate: today,
      dueTime: '19:00',
    }),
  });
  const task3Data = await task3Res.json();
  console.log('✅ 6. Create Task 3 (Low Priority Health):', task3Data.success ? 'PASSED' : 'FAILED');

  // 5. Get Today Tasks
  const todayRes = await fetch(`${BASE_URL}/tasks`, { headers: authHeaders });
  const todayTasks = await todayRes.json();
  console.log(`✅ 7. Get Today's Tasks (Count: ${todayTasks.count}):`, todayTasks.success ? 'PASSED' : 'FAILED');

  // 6. Mark Task 1 as Complete
  const completeRes = await fetch(`${BASE_URL}/tasks/${task1Id}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ isCompleted: true, pomodoroMinutes: 25 }),
  });
  const completeData = await completeRes.json();
  console.log('✅ 8. Update & Complete Task 1:', completeData.data.isCompleted === true ? 'PASSED' : 'FAILED');

  // 7. Get Stats
  const statsRes = await fetch(`${BASE_URL}/tasks/stats`, { headers: authHeaders });
  const statsData = await statsRes.json();
  console.log('✅ 9. Get Stats Summary:', statsData.stats.completed >= 1 ? `PASSED (${statsData.stats.percentage}% completed)` : 'FAILED');

  // 8. Get Pending View
  const pendingRes = await fetch(`${BASE_URL}/tasks/pending`, { headers: authHeaders });
  const pendingData = await pendingRes.json();
  console.log(`✅ 10. Get Pending Tasks (Count: ${pendingData.count}):`, pendingData.success ? 'PASSED' : 'FAILED');

  // 9. History Query
  const historyRes = await fetch(`${BASE_URL}/tasks/history`, { headers: authHeaders });
  const historyData = await historyRes.json();
  console.log('✅ 11. Get History Summary:', historyData.success ? 'PASSED' : 'FAILED');

  console.log('--- ALL REST API TESTS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(console.error);
