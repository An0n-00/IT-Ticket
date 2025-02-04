'use strict';

//Non Document dependent function calls:
checkToken(null, 'redirectToLogin');

/*
# dashboard.js

Purpose:
- logic of the dashboard 
*/

//Constants:
const username = localStorage.getItem('username');
const headerTitle = document.querySelector('#header-title');
const issuesList = document.querySelector('#issues-list');
let page = 0;
let endOfList = false;
let loading = false;

//Functions:
function handleResponse(data) {
    if (data) {
        data.forEach((issue) => {
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
                    issueStatus.innerHTML = '<i class="fas fa-question"></i> Status: Unknown';
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
            issueElement.addEventListener('click', () => {
                redirectToSite(`/pages/issue?id=${issueGUID}`);
            });

            issueElement.classList.add('issue');
            issuesList.appendChild(issueElement);
        });
    }
}

async function updateList() {
    if (endOfList || loading) {
        return;
    }
    page++;
    loading = true;
    let issues = await request('GET', '/api/issue/all?limit=10&page=' + page + "&sort=newest&status=!closed");
    if (!(issues instanceof Error) && issues.length !== 0) {
        handleResponse(issues);
    } else if (issues.length === 0) {
        let noMoreIssuesList = document.createElement('p');
        noMoreIssuesList.classList.add('no-more-issues');
        noMoreIssuesList.innerText = 'No more issues to display🙂';
        issuesList.appendChild(noMoreIssuesList);
        endOfList = true;
    } else if ((issues instanceof Error)) {
        handleError(issues, issues.message, false);
    }
    loading = false;
}

// Main Function

document.addEventListener('DOMContentLoaded', () => {
    headerTitle.innerText = `Welcome, ${username}`;
    updateList().then().catch((error) => {
        handleError(error, error.message, true)
    });

    window.addEventListener('scroll', () => {
        if (endOfList) {
            return;
        } 
        if (window.innerHeight + window.scrollY >= issuesList.offsetHeight * 0.999999) {
            updateList().then().catch((error) => {
                handleError(error, error.message, true);
            });
        } 
    });
});