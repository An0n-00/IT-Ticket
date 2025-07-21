const API_BASE = '/auth/api';
const USER_API = '/api/user';

const CREDENTIALS = {
    defaultUser: { username: 'testuser', password: 'TestPassword123!' },
    updatedUser: { username: 'UpdatedUsername', password: 'UpdatedPassword123!' },
    admin: { username: 'Administrator', password: 'admin123' }
};

const log = {
    success: (msg, data) => console.log(`✅ ${msg}`, data || ''),
    error: (msg, data) => console.error(`❌ ${msg}`, data || ''),
    info: (msg, data) => console.log(`ℹ️ ${msg}`, data || '')
};

// Generic login function
async function login(credentials) {
    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        if (res.ok) {
            const data = await res.json();
            log.success(`Login successful for ${credentials.username}`, data);
            return { authToken: data.jwt, userId: data.userId };
        }

        const err = await res.json();
        log.error(`Login failed for ${credentials.username}`, err);
    } catch (err) {
        log.error('Unexpected login error:', err.message);
    }
    return {};
}

// Test login fallback
async function testLogin() {
    const loginAttempt1 = await login(CREDENTIALS.defaultUser);
    if (loginAttempt1.authToken) return loginAttempt1;

    log.info('Trying fallback credentials...');
    return await login(CREDENTIALS.updatedUser);
}

// GET /api/user
async function testUser(authToken) {
    try {
        const res = await fetch(`${USER_API}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }
        });

        const data = await res.json();
        res.ok ? log.success('Fetched user', data) : log.error('Failed to fetch user', data);
        return data;
    } catch (err) {
        log.error('Error fetching user', err.message);
    }
}

// GET /api/user/{id}
async function testUserById(authToken, userId) {
    try {
        const res = await fetch(`${USER_API}/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }
        });

        const data = await res.json();
        res.ok ? log.success('Fetched user by ID', data) : log.error('Failed to fetch user by ID', data);
        return data;
    } catch (err) {
        log.error('Error fetching user by ID', err.message);
    }
}

// GET /api/user/{id} for another user (not self)
async function testUserByIdNotOwn(authToken) {
    const anotherUserId = '13454652-0ea4-4cb7-b2a2-08ddbed5dd4e';
    try {
        const res = await fetch(`${USER_API}/${anotherUserId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }
        });

        const data = await res.json();
        if (res.status === 403 || res.status === 401) {
            log.success('Access denied to another user\'s data (as expected)');
        } else {
            res.ok ? log.error('Fetched another user (unexpected). This should not happen', data) : log.error('Failed to fetch another user', data);
        }
    } catch (err) {
        log.error('Error fetching another user', err.message);
    }
}

// GET /api/user/all as regular user
async function testUserAll(authToken) {
    try {
        const res = await fetch(`${USER_API}/all`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }
        });

        const data = await res.json();
        if (res.status === 403 || res.status === 401) {
            log.success('Access denied for fetching all users (non-admin as expected)');
        } else {
            res.ok ? log.error('Fetched all users (non-admin). This should not happen', data) : log.error('Failed to fetch all users', data);
        }
        return data;
    } catch (err) {
        log.error('Error fetching all users (non-admin)', err.message);
    }
}

// GET /api/user/all as admin
async function testUserAllAsAdmin() {
    const { authToken } = await login(CREDENTIALS.admin);
    if (!authToken) return;

    try {
        const res = await fetch(`${USER_API}/all`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }
        });

        const data = await res.json();
        res.ok ? log.success('Fetched all users (admin)', data) : log.error('Failed to fetch all users (admin)', data);
        return data;
    } catch (err) {
        log.error('Error fetching all users (admin)', err.message);
    }
}

// PATCH /api/user/{id}
async function updateUser(authToken, userId) {
    const userDetails = {
        Username: 'UpdatedUsername',
        Firstname: 'UpdatedFirstname',
        Lastname: 'UpdatedLastname',
        Password: 'UpdatedPassword123!',
        Email: 'updatedemail@example.com'
    };

    try {
        const res = await fetch(`${USER_API}/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(userDetails)
        });

        const data = await res.json();
        res.ok ? log.success('User updated successfully', data) : log.error('Failed to update user', data);
        return data;
    } catch (err) {
        log.error('Error updating user', err.message);
    }
}

async function testDeleteUser(authToken, userId, isAdmin = false) {
    if (!authToken) {
        log.error('authToken is missing.');
        return;
    }

    const scenarios = [
        {
            description: 'Delete another user without admin rights (should fail)',
            id: '13454652-0ea4-4cb7-b2a2-08ddbed5dd4e',
            expectSuccess: false,
            skip: isAdmin // Admin will handle this case separately
        },
        {
            description: 'Delete with bogus ID (should return 405/400)',
            id: '1',
            expectSuccess: false
        },
        {
            description: 'Delete non-existent user (should return 404)',
            id: '00000000-0000-0000-0000-000000000000',
            expectSuccess: false
        },
        {
            description: 'Delete own user (should succeed)',
            id: userId,
            expectSuccess: true
        }
    ];

    for (const scenario of scenarios) {
        if (scenario.skip) continue;

        try {
            const res = await fetch(`/api/user/${scenario.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (scenario.expectSuccess && res.status === 204) {
                log.success(`${scenario.description} - Success`);
            } else if (!scenario.expectSuccess && [400, 401, 403, 404].includes(res.status)) {
                const errorMsg = await res.text();
                log.info(`${scenario.description} - Expected failure`, { status: res.status, error: errorMsg });
            } else {
                const data = await res.text();
                log.error(`${scenario.description} - Unexpected result`, { status: res.status, response: data });
            }
        } catch (err) {
            log.error(`${scenario.description} - Request error`, err.message);
        }
    }
}


// Run all tests
async function runAllTests() {
    const { authToken, userId } = await testLogin();
    if (!authToken || !userId) {
        log.error('Cannot run tests without a valid login');
        return;
    }

    await testUser(authToken, userId);
    await testUserById(authToken, userId);
    await testUserByIdNotOwn(authToken);
    await testUserAll(authToken);
    await testUserAllAsAdmin();
    await updateUser(authToken, userId);
    await testDeleteUser(authToken, userId, false); 
}


// Run
await runAllTests();
