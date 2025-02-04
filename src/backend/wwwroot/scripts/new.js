'use strict';

//Non Document dependent function calls:
//On every site with according action (redirectToLogin|redirectToDashboard|null)
checkToken(null,'redirectToLogin');

/*
# _name_.js

Purpose:
- Short summary what is in here
*/

//Constants:
const newIssueForm = document.querySelector('#issue-form');

//Functions:
function addEventToNewIssueForm() {
    if (newIssueForm) {
        newIssueForm.addEventListener('submit',  (e) => {
            e.preventDefault();
            createNewIssue().then().catch((e) => {
                handleError(e, 'Please try again', true);
            });
        });
    } else {
        handleError(new Error('Form not found'), 'Please reload the site', true);
    }
}

async function createNewIssue() {
    let newIssue = {
        title: document.querySelector('#title').value,
        description: document.querySelector('#description').value,
        priority: document.querySelector('#priority').value
    };

    let response = await request('POST', `/api/issue`, newIssue);
    redirectToSite(`/pages/issue?id=${response.id}&new=true`);
}

// Main Function
document.addEventListener('DOMContentLoaded', () => {
    addEventToNewIssueForm();
});
