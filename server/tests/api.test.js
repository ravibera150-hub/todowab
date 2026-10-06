import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Test 1: Password Hashing with Bcrypt
test('Password Hashing & Verification', async () => {
  const rawPassword = 'Password123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  
  assert.notEqual(rawPassword, hashedPassword, 'Hashed password must not equal raw password');
  
  const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
  assert.equal(isMatch, true, 'Bcrypt compare must return true for correct password');
  
  const isInvalid = await bcrypt.compare('WrongPassword', hashedPassword);
  assert.equal(isInvalid, false, 'Bcrypt compare must return false for wrong password');
});

// Test 2: JWT Token Signing & Verification
test('JWT Token Generation & Decryption', () => {
  const secretKey = 'test_secret_key_wad_pbl';
  const payload = { userId: '507f1f77bcf86cd799439011', email: 'student@gecg.ac.in' };
  
  const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
  assert.ok(token, 'JWT token should be generated successfully');
  
  const decoded = jwt.verify(token, secretKey);
  assert.equal(decoded.userId, payload.userId, 'Decoded user ID must match payload');
  assert.equal(decoded.email, payload.email, 'Decoded email must match payload');
});

// Test 3: Task Model Data Validation Rules
test('Task Data Schema Validation', () => {
  const validTask = {
    title: 'Complete WAD PBL Activity 3 Report',
    category: 'Study',
    priority: 'High',
    completed: false,
    dueDate: new Date().toISOString()
  };
  
  assert.ok(validTask.title.trim().length > 0, 'Task title cannot be empty');
  assert.ok(['High', 'Medium', 'Low'].includes(validTask.priority), 'Priority must be High, Medium, or Low');
  assert.ok(['Work', 'Personal', 'Study', 'Health', 'Urgent'].includes(validTask.category), 'Category must be valid');
  assert.equal(typeof validTask.completed, 'boolean', 'Completed status must be boolean');
});

// Test 4: Simulated CRUD Operations Logic
test('Simulated Task Array CRUD Operations', () => {
  let taskStore = [];
  
  // CREATE
  const newTask = { id: 1, title: 'Build React UI with Bootstrap', category: 'Work', completed: false };
  taskStore.push(newTask);
  assert.equal(taskStore.length, 1, 'Task store should have 1 task');
  
  // READ
  const foundTask = taskStore.find(t => t.id === 1);
  assert.equal(foundTask.title, 'Build React UI with Bootstrap');
  
  // UPDATE
  foundTask.completed = true;
  assert.equal(taskStore[0].completed, true, 'Task should be marked as completed');
  
  // DELETE
  taskStore = taskStore.filter(t => t.id !== 1);
  assert.equal(taskStore.length, 0, 'Task store should be empty after deletion');
});
