'use strict';
// Non Document dependent function calls:
checkToken(null, 'redirectToLogin');

/*
# edit.js

Purpose:
- Handles the editing of an issue.
*/

// Constants:
let editForm = document.querySelector('#issue-form');
let title = document.querySelector('#title');
let description = document.querySelector('#description');
let priority = document.querySelector('#priority');
let status = document.querySelector('#status');
let issueID = getURLParam('id');
if (issueID instanceof Error) {
    redirectToSite('/pages/dashboard');
}

let isAuthorized = localStorage.getItem('role') === 'admin';
let isAuthorizedToUpdateStatus = localStorage.getItem('role') === 'admin';

// Functions:
async function getIssue() {
    let issue = await request('GET', `/api/issue/${issueID}`);
    if (!(issue instanceof Error)) {
        handleResponse(issue);
    } else {
        redirectToSite('/pages/dashboard');
    }
}

function handleResponse(data) {
    title.value = data.title;
    description.value = data.description;
    priority.value = data.priority.toLowerCase().replace(' ', '-');
    status.value = data.status.toLowerCase().replace(' ', '-');
    updatePriorityColor(priority);
    updateStatusColor(status);
    isAuthorized = isAuthorized || localStorage.getItem('UserId') === data.userId;
}

function addEventToEditForm() {
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        editIssue();
    });
}

function editIssue() {
    let data;
    if (!isAuthorizedToUpdateStatus) {
        data = {
            title: title.value,
            description: description.value,
            priority: priority.value,
        };
    } else {
        data = {
            title: title.value,
            description: description.value,
            priority: priority.value,
            status: status.value,
        };
    }

    request('PUT', `/api/issue/${issueID}`, data).then((response) => {
        if (response instanceof Error) {
            handleError(response, null, true);
        } else {
            notifyUser('Issue Updated Successfully - Redirecting to Dashboard in 3 seconds');
            setTimeout(() => {
                redirectToSite('/pages/dashboard');
            }, 3000);
        }
    });
}


// Main Function
document.addEventListener('DOMContentLoaded', () => {
    getIssue().then().catch(() => {
            redirectToSite('/pages/dashboard');
    }).finally(() => {
        if (!isAuthorized) {
            redirectToSite('/pages/dashboard');
        }

        if (!isAuthorizedToUpdateStatus) {
            document.querySelector('#label-status').style.display = 'none';
            document.querySelector('#status').style.display = 'none';
        }
    });
    
    addEventToEditForm();
});
