const AUTH_API = '/auth/api';

const log = {
    success: (msg, data) => console.log(`✅ ${msg}`, data || ''),
    error: (msg, data) => console.error(`❌ ${msg}`, data || ''),
    info: (msg, data) => console.log(`ℹ️ ${msg}`, data || '')
};

const testUser = {
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User'
};

// Generic POST request handler
async function postRequest(name, url, payload) {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            log.success(`${name} successful`, data);
        } else {
            log.error(`${name} failed`, data);
        }

        return { ok: res.ok, data };
    } catch (err) {
        log.error(`Error during ${name.toLowerCase()}`, err.message);
        return { ok: false, data: null };
    }
}

// Register new user
async function testRegister() {
    return await postRequest('Register', `${AUTH_API}/register`, testUser);
}

// Login user
async function testLogin() {
    const { username, password } = testUser;
    return await postRequest('Login', `${AUTH_API}/login`, { username, password });
}

// Run all tests in sequence
async function runAllTests() {
    const regResult = await testRegister();

    if (!regResult.ok && regResult.data?.message?.includes('Invalid Username')) {
        log.info('User already registered, proceeding to login...');
    }

    await testLogin();
}

// Run
await runAllTests();
