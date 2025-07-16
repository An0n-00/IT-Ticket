const API_BASE = '/api/Comment';
const TOKEN = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJjZXJ0c2VyaWFsbnVtYmVyIjoiYmYyOTJkNDctZWE2ZS00MmZmLTg0MGQtMDhkZGMxNjM5MTk1IiwianRpIjoiNWQ3NDk3ZjItNTZlNC00NzZhLWIwZWEtYTQ2Njk1YThkNjE1IiwibmJmIjoxNzUyNjg1ODAxLCJleHAiOjE3NTMxMTc4MDEsImlhdCI6MTc1MjY4NTgwMSwiaXNzIjoiSVQtVGlja2V0IElzc3VlciIsImF1ZCI6IklULVRpY2tldCBVc2VycyJ9.ufHp8TsAv2AzrFwc2_T9vPMsELfVbbfCpHyjlAe4GUjqJrbICKGneKidSC8umvyXN11sgESUNsg0KmlpLL6R6g'; // Replace with your actual token

// Helper for headers
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
};

// CREATE a comment (POST)
async function createComment(issueId, commentDto) {
    const res = await fetch(`${API_BASE}/${issueId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(commentDto)
    });
    return res.json();
}

// READ a comment (GET)
async function getComment(commentId) {
    const res = await fetch(`${API_BASE}/${commentId}`, {
        method: 'GET',
        headers
    });
    return res.json();
}

// UPDATE a comment (PATCH)
async function updateComment(commentId, commentDto) {
    const res = await fetch(`${API_BASE}/${commentId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(commentDto)
    });
    return res.json();
}

// DELETE a comment (DELETE)
async function deleteComment(commentId) {
    const res = await fetch(`${API_BASE}/${commentId}`, {
        method: 'DELETE',
        headers
    });
    return res.status; // 204 means success
}

// Example usage:
(async () => {
    // Sample data
    const issueId = '5ce2852a-567c-42ec-7557-08ddc16391a8';
    const commentDto = { content: 'Hello world!' };

    // Create a root comment
    const created = await createComment(issueId, commentDto);
    console.log('Created:', created);

    // Create a reply to the root comment
    const replyDto = {
        content: 'This is a reply!',
        ParentCommentId: created.id
    };
    const reply = await createComment(issueId, replyDto);
    console.log('Reply:', reply);

    // Read the reply
    const readReply = await getComment(reply.id);
    console.log('Read Reply:', readReply);

    // Update the reply
    const updatedReply = await updateComment(reply.id, { content: 'Updated reply content!' });
    console.log('Updated Reply:', updatedReply);

    // Delete the reply
    const deletedReplyStatus = await deleteComment(reply.id);
    console.log('Deleted Reply status:', deletedReplyStatus);

    // Optionally, delete the root comment
    const deletedRootStatus = await deleteComment(created.id);
    console.log('Deleted Root status:', deletedRootStatus);
})();
