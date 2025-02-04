'use strict';

//Non Document dependent function calls:
//On every site with according action (redirectToLogin|redirectToDashboard|null)
checkToken(null, 'redirectToLogin').then().catch();

/*
# user.js

Purpose:
- JavaScript file for the user.html page
*/

//Constants:
let uid = getURLParam('id');
if (uid instanceof Error) {
    redirectToSite('/pages/dashboard');
}
let usernameElement = document.querySelector('#user-name-value');
let firstNameElement = document.querySelector('#user-firstname-value');
let lastNameElement = document.querySelector('#user-lastname-value');
let roleElement = document.querySelector('#user-role-value');
let issueElement = document.querySelector('#user-issues-value');
let issuesElement = document.querySelector('#user-issues-list');
let isAuthorized = localStorage.getItem('role') === 'admin';

//Functions:
function getUser(id) {
    let response = request('GET', `/auth/api/user/${id}`);
    if (!(response instanceof Error)) {
        return response;
    } else {
        redirectToSite('/pages/dashboard');
    }
}

function handleData(user) {
    
    if (user) {
        usernameElement.innerText = user.username;
        firstNameElement.innerText = user.firstname;
        lastNameElement.innerText = user.lastname;
        roleElement.innerText = user.role;
        
        if (user.firstname === null) {
            firstNameElement.remove();
            document.querySelector('#user-firstname').remove();
        }
        
        if (user.lastname === null) {
            lastNameElement.remove();
            document.querySelector('#user-lastname').remove();
        }
        
        if (user.role === "admin") {
            usernameElement.innerHTML += ' <span style="color: var(--primary-color); font-style: italic">(Official <i class="fas fa-crown"></i>)</span>';
        } 
    } else {
        handleError(new Error('No data found'), 'No data found', true);
    }
}

async function getIssue(uid) {
    let response = request('GET', `/api/issue/all?createdBy=${uid}`);
    response = await response;
    if (!(response instanceof Error)) {
        return response;
    } else {
        throw  new Error('No data found');
    }
}

function handleIssues(issues) {
    issueElement.innerText = issues.length;
    if (issues) {
        issues.forEach((issue) => {
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
            issuesElement.appendChild(issueElement);

            issueElement.addEventListener('click', () => {
                redirectToSite(`/pages/issue?id=${issueGUID}`);
            });
        });
    } else {
        handleError(new Error('No data found'), 'No data found', true);
    }
}

async function promoteUser() {
    let response = request('POST', `/auth/api/user/${uid}/promote`);
    response = await response;
    if (!(response instanceof Error)) {
        notifyUser('User promoted successfully');
        setTimeout(() => {
            location.reload();
        }, 3000);
    } else {
        handleError(response, 'Failed to promote user', true);
    }
}

async function deleteUser() {
    let response = request('DELETE', `/auth/api/user/${uid}`);
    response = await response;
    if (!(response instanceof Error)) {
        notifyUser('User deleted successfully');
        setTimeout(() => {
            redirectToSite('/pages/dashboard');
        }, 3000);
    } else {
        handleError(response, 'Failed to delete user', true);
    }
    
}

// Main Function
document.addEventListener('DOMContentLoaded', () => {
    getUser(uid).then((user) => {
        handleData(user);
    }).catch(() => {
        redirectToSite('/pages/dashboard');
    });
    
    getIssue(uid).then((issues) => {
        handleIssues(issues);
    }).catch(() => {
        document.querySelector('#user-issues').remove();
        issueElement.innerHTML = 'This User has no issues yet';
    });
    
    if (!isAuthorized) {
        document.querySelector('.right-sidebar').remove();
    } else {
        document.querySelector('#promote-user').addEventListener('click', async () => {
            let confirmPromotion = await confirmAction('Do you really want to promote this user to an admin?<br><span style="font-weight: bold; color: red;">This action cannot be undone!</span>', 'Yes Please!', 'No')
            if (confirmPromotion === true) {
                promoteUser().catch();
            } else {
                notifyUser('Promotion cancelled');
            }
        });

        document.querySelector('#delete-user').addEventListener('click', async () => {
            let confirmDeletion = await confirmAction('Do you really want to delete this user?<br><span style="font-weight: bold; color: red;">This action cannot be undone!</span>', 'Yes Please!', 'No')
            if (confirmDeletion === true) {
                deleteUser().catch();
            } else {
                notifyUser('Deletion cancelled');
            }
        });
    }
});
