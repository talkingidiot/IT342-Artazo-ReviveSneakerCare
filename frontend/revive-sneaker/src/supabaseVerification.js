/**
 * Supabase Verification Script
 * 
 * This script helps verify if data is actually being saved to Supabase.
 * Run this in the browser console after registering a user.
 */

// 1. Check if user is in localStorage
console.log('=== FRONTEND CHECK ===');
console.log('Token stored:', !!localStorage.getItem('authToken'));
console.log('User stored:', localStorage.getItem('user'));

// 2. Test the full flow
const testFullFlow = async () => {
  console.log('\n=== FULL REGISTRATION TEST ===');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123';
  const testName = 'Test User ' + Date.now();

  try {
    // Step 1: Test backend connectivity
    console.log('\n1️⃣ Testing backend connectivity...');
    const healthResponse = await fetch('http://localhost:8080/api/health');
    console.log('Backend health:', healthResponse.status, healthResponse.ok ? '✓' : '✗');

    // Step 2: Register
    console.log('\n2️⃣ Registering user:', testEmail);
    const registerResponse = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword
      })
    });

    const registerData = await registerResponse.json();
    console.log('Register status:', registerResponse.status);
    console.log('Register response:', registerData);

    if (registerData.token) {
      console.log('✓ Token received:', registerData.token.substring(0, 30) + '...');
      console.log('✓ User data:', { name: registerData.name, email: registerData.email, role: registerData.role });
    } else {
      console.log('✗ No token in response');
    }

    // Step 3: Try to login with same credentials
    console.log('\n3️⃣ Testing login with same credentials...');
    const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login status:', loginResponse.status);
    
    if (loginResponse.ok) {
      console.log('✓ Login successful');
      console.log('✓ Token received:', loginData.token.substring(0, 30) + '...');
    } else {
      console.log('✗ Login failed:', loginData.message || loginData);
      console.log('⚠️ This suggests user was NOT saved to database');
    }

    // Step 4: Check localStorage
    console.log('\n4️⃣ Checking localStorage...');
    console.log('Token:', localStorage.getItem('authToken') ? '✓' : '✗');
    console.log('User data:', localStorage.getItem('user'));

  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

// 3. Check if Supabase is accessible
const testSupabaseConnection = async () => {
  console.log('\n=== SUPABASE CONNECTION TEST ===');
  console.log('Note: This test will fail if Supabase doesn\'t expose metrics, but backend might still work');
  
  try {
    // Try to reach Supabase (this might not work due to CORS, but we can see the error)
    const response = await fetch('https://aws-1-ap-south-1.pooler.supabase.com:5432/');
    console.log('Supabase response:', response.status);
  } catch (error) {
    console.log('Expected error (CORS):', error.message);
    console.log('This is normal - backend should still be able to connect');
  }
};

// 4. Detailed error logging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

console.log('\n📋 Available tests:');
console.log('- testFullFlow() - Test register and login');
console.log('- testSupabaseConnection() - Test Supabase connectivity');
console.log('\n🔍 Check these for issues:');
console.log('1. Backend logs for SQL errors');
console.log('2. Supabase dashboard for users table');
console.log('3. Network tab to see actual API responses');
