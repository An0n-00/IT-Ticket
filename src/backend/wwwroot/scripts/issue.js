'use strict';

//Non Document dependent function calls:
//On every site with according action (redirectToLogin|redirectToDashboard|null)
checkToken(null, 'redirectToLogin').then().catch();

/*
# issue.js

Purpose:
- JavaScript file for the issue.html page
*/

//Constants:
const id = getURLParam('id');
if (id instanceof Error) {
    redirectToSite('/pages/dashboard');
}
const isNew = getURLParam('new');
let isAuthorized = localStorage.getItem('role') === 'admin' || localStorage.getItem('UserId') === id;

//Functions:

function handleResponse(issue) {
    if (issue) {
        let issueElement = document.createElement('article');
        let issueHeader = document.createElement('div');
        let issueTitle = document.createElement('h3');
        let issueAuthorName = document.createElement('p');
        let issueMeta = document.createElement('div');
        let issuePriority = document.createElement('p');
        let issueStatus = document.createElement('p');
        let issueCreatedAt = document.createElement('p');
        let issueDescription = document.createElement('p');
        let issueGUID = issue.id;

        issueTitle.innerText = issue.title;
        issueAuthorName.innerText = `Author: ${issue.createdBy}`;
        issueAuthorName.setAttribute('id', `${issue.userId}`);
        issueCreatedAt.innerText = `Created At: ${new Date(issue.createdDate).toLocaleString()}`;
        issuePriority.innerText = `Priority: ${issue.priority}`;
        switch (issue.priority.toLowerCase()) {
            case 'low':
                issuePriority.style.color = 'green';
                issuePriority.innerHTML = '<i class="fas fa-angle-double-down"></i> Low';
                break;
            case 'medium':
                issuePriority.style.color = 'orange';
                issuePriority.innerHTML = '<i class="fas fa-angle-double-right"></i> Medium';
                break;
            case 'high':
                issuePriority.style.color = 'red';
                issuePriority.innerHTML = '<i class="fas fa-angle-double-up"></i> High';
                break;
            default:
                issuePriority.style.color = 'black';
                issuePriority.innerHTML = '<i class="fas fa-question"></i> Unknown';
        }
        issueStatus.innerText = `Status: ${issue.status}`;
        switch (issue.status.toLowerCase()) {
            case 'open':
                issueStatus.style.color = 'green';
                issueStatus.innerHTML = '<i class="fas fa-play"></i> Status: Open';
                break;
            case 'in-progress':
                issueStatus.style.color = 'orange';
                issueStatus.innerHTML = '<i class="fas fa-tasks"></i> Status: In Progress';
                issueCreatedAt.innerText = `Updated At: ${new Date(issue.updatedDate).toLocaleString()}`;
                break;
            case 'closed':
                issueStatus.style.color = 'red';
                issueStatus.innerHTML = '<i class="fas fa-check-circle"></i> Status: Closed';
                issueCreatedAt.innerText = `Closed At: ${new Date(issue.resolvedDate).toLocaleString()}`;
                break;
            default:
                issueStatus.style.color = 'black';
                issueStatus.innerHTML = '<i class="fas fa-question"></i> Unknown';
        }
        issueDescription.innerText = issue.description;
        issueAuthorName.classList.add('issue-author');
        issueMeta.classList.add('issue-meta');
        issueHeader.classList.add('issue-header');

        issueHeader.appendChild(issueTitle);
        issueHeader.appendChild(issueAuthorName);
        issueMeta.appendChild(issuePriority);
        issueMeta.appendChild(issueStatus);
        issueMeta.appendChild(issueCreatedAt);
        issueElement.appendChild(issueHeader);
        issueElement.appendChild(issueMeta);
        issueElement.appendChild(issueDescription);
        issueElement.setAttribute('data-guid', issueGUID);
        issueElement.classList.add('issue');
        document.querySelector('#issue').appendChild(issueElement);
        
        issueAuthorName.style.cursor = 'pointer';        
        issueAuthorName.addEventListener('click', (event) => {
            const userId = event.target.getAttribute('id');
            redirectToSite(`/pages/user?id=${userId}`);
        });
        
    } else {
        handleError(new Error('No data found'), 'No data found', true);
    }
}

async function getIssue() {
    const response = await request('GET', `/api/issue/${id}`);
    if (!(response instanceof Error)) {
        if (isNew === 'true') {
            notifyUser('Issue created successfully');
            history.pushState(null, '', `/pages/issue?id=${id}`);
        }
        isAuthorized = isAuthorized || localStorage.getItem('UserId') === response.userId;
        handleResponse(response);
    } else {
        setTimeout(() => {
            redirectToSite('/pages/dashboard');
        }, 3500);
        handleError(new Error('Issue not found'), 'The requested issue could not be found', true);
    }
}

function authorizedActions() {
    document.querySelector('#delete-issue').addEventListener('click', () => {
        confirmAction('Are you sure you want to delete this issue?', 'Delete Issue', 'Cancel')
            .then((result) => {
                if (result) {
                    request('DELETE', `/api/issue/${id}`).then((response) => {
                        if (!(response instanceof Error)) {
                            notifyUser('Issue deleted successfully');
                            setTimeout(() => {
                                redirectToSite('/pages/dashboard');
                            }, 2000);
                        } else {
                            handleError(response, response.message, false);
                        }
                    });
                }
            });
    });
    
    document.querySelector('#edit-issue').addEventListener('click', () => {
        redirectToSite(`/pages/edit?id=${id}`);
    });
}


// Main Function
document.addEventListener('DOMContentLoaded', () => {
    getIssue().then().catch((error) => {
        handleError(error, error.message, true);
    });
    
    let intervalId = setInterval(() => {
        if (!isAuthorized) {
            document.querySelector('.right-sidebar').style.display = 'none';
        } else {
            document.querySelector('.right-sidebar').style.display = 'block';
            clearInterval(intervalId);
        }
    }, 1);
    
    authorizedActions();
});
