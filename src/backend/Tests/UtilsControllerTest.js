const log = {
    success: (msg, data) => console.log(`✅ ${msg}`, data || ''),
    error: (msg, data) => console.error(`❌ ${msg}`, data || ''),
    info: (msg, data) => console.log(`ℹ️ ${msg}`, data || '')
};

// Generic GET request tester
async function testGetEndpoint(endpointName, path) {
    try {
        const res = await fetch(path);
        const data = await res.json();

        if (res.ok) {
            log.success(`${endpointName} response`, data);
        } else {
            log.error(`${endpointName} returned an error`, data);
        }

        return data;
    } catch (err) {
        log.error(`Failed to test ${endpointName}`, err.message);
    }
}

// Specific endpoint testers
async function testPing() {
    return await testGetEndpoint('Ping', '/ping');
}

async function testIndex() {
    return await testGetEndpoint('Index', '/');
}

// Run all tests in sequence
async function runAllTests() {
    await testIndex();
    await testPing();
}

// Run
await runAllTests();
