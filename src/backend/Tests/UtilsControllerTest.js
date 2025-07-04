// Test /ping
async function testPing() {
    const res = await fetch(`/ping`);
    const data = await res.json();
    console.log('Ping:', data);
    return data;
}

// Test /
async function testIndex() {
    const res = await fetch(`/`);
    const data = await res.json();
    console.log('Index:', data);
    return data;
}

// Run all tests in sequence
async function runAllTests() {
    await testIndex();
    await testPing();
}

await runAllTests();