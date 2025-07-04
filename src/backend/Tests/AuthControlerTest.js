// Test /auth/api/register
async function testRegister() {
    const payload = {
        email: 'testuser@example.com',
        password: 'TestPassword123!',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User'
    };
    const res = await fetch(`/auth/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('Register:', data);
    return data;
}

// Test /auth/api/login
async function testLogin() {
    const payload = {
        username: 'testuser',
        password: 'TestPassword123!'
    };
    const res = await fetch(`/auth/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('Login:', data);
    return data;
}

// Run all tests in sequence
async function runAllTests() {
    await testRegister();
    await testLogin();
}

await runAllTests();