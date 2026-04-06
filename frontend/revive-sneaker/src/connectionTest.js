/**
 * Test Configuration for Frontend-Backend Connection
 * 
 * This file helps verify that your frontend can communicate with the backend.
 * Run this in the browser console after the app loads.
 */

// Test 1: Check if API client is available
console.log("🔍 Test 1: API Client");
console.log("authAPI available:", typeof authAPI !== 'undefined');

// Test 2: Check backend connectivity
const testBackendConnection = async () => {
  console.log("\n🔍 Test 2: Backend Connectivity");
  try {
    const response = await fetch('http://localhost:8080/api/health');
    const data = await response.json();
    console.log("✓ Backend is running!");
    console.log("Response:", data);
  } catch (error) {
    console.error("✗ Backend not reachable:", error.message);
    console.log("Make sure backend is running on port 8080");
  }
};

// Test 3: Check localStorage
const testLocalStorage = () => {
  console.log("\n🔍 Test 3: LocalStorage");
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  console.log("Token stored:", !!token);
  console.log("User stored:", !!user);
  if (user) console.log("User data:", JSON.parse(user));
};

// Test 4: Test register endpoint
const testRegister = async (email, password) => {
  console.log("\n🔍 Test 4: Register Endpoint");
  try {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: email,
        password: password
      })
    });
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", data);
    return data;
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Test 5: Test login endpoint
const testLogin = async (email, password) => {
  console.log("\n🔍 Test 5: Login Endpoint");
  try {
    const response = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", data);
    return data;
  } catch (error) {
    console.error("Error:", error.message);
  }
};

// Run all tests
console.log("====================================");
console.log("🚀 Frontend-Backend Connection Tests");
console.log("====================================");

testBackendConnection();
testLocalStorage();

console.log("\n📝 Usage:");
console.log("testRegister('test@example.com', 'password123')");
console.log("testLogin('test@example.com', 'password123')");
console.log("\n✓ Tests ready! Open browser DevTools Console to see results.");
