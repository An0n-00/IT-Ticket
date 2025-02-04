'use strict';

//Non Document dependent function calls:
//On every site with according action (redirectToLogin|redirectToDashboard|null)
checkToken(null, 'redirectToLogin');

/*
# search.js

Purpose:
- Short summary what is in here
*/

//Constants:
let searchArea = document.querySelector('form');
let query = searchArea.querySelector('#search-query').value.toLowerCase();
let priority = searchArea.querySelector('#priority-filter').value.toLowerCase();
let status = searchArea.querySelector('#status-filter').value.toLowerCase();
let issuesList = document.querySelector('#results');
let loading = false;

//Functions:
async function updateList() {
    if (loading) {
        return;
    }
    loading = true;
    query = encodeURI(searchArea.querySelector('#search-query').value.toLowerCase());
    priority = encodeURI(searchArea.querySelector('#priority-filter').value.toLowerCase());
    status = encodeURI(searchArea.querySelector('#status-filter').value.toLowerCase());
    if (query && priority && status) {
        let response = await request('GET', `/api/Issue/all?query=${query}&priority=${priority}&status=${status}&sort=newest`);
        if (!(response instanceof Error) && response.length !== 0) {
            handleResponse(response);
        } else if (response.length === 0) {
            issuesList.innerHTML = '<p style="font-size: larger">No Results to show</p>';
        } else {
            handleError(response, 'Please try again', true);
        }
    } else if ((query && priority) && !status) {
        let response = await request('GET', `/api/Issue/all?query=${query}&priority=${priority}&sort=newest`);
        if (!(response instanceof Error) && response.length !== 0) {
            handleResponse(response);
        } else if (response.length === 0) {
            issuesList.innerHTML = '<p style="font-size: larger">No Results to show</p>';
        } else {
            handleError(response, 'Please try again', true);
        }
    } else if ((query && status) && !priority) {
        let response = await request('GET', `/api/Issue/all?query=${query}&status=${status}&sort=newest`);
        if (!(response instanceof Error) && response.length !== 0) {
            handleResponse(response);
        } else if (response.length === 0) {
            issuesList.innerHTML = '<p style="font-size: larger">No Results to show</p>';
        } else {
            handleError(response, 'Please try again', true);
        }
    } else if ((priority && status) && !query) {
        let response = await request('GET', `/api/Issue/all?priority=${priority}&status=${status}&sort=newest`);
        if (!(response instanceof Error) && response.length !== 0) {
            handleResponse(response);
        } else if (response.length === 0) {
            issuesList.innerHTML = '<p style="font-size: larger">No Results to show</p>';
        } else {
            handleError(response, 'Please try again', true);
        }
    } else if (query && !priority && !status) {
        let response = await request('GET', `/api/Issue/all?query=${query}&sort=newest`);
        if (!(response instanceof Error) && response.length !== 0) {
            handleResponse(response);
        } else if (response.length === 0) {
            issuesList.innerHTML = '<p style="font-size: larger">No Results to show</p>';
        } else {
            handleError(response, 'Please try again', true);
        }
    } else if (priority && !query && !status) {
        let response = await request('GET', `/api/Issue/all?priority=${priority}&sort=newest`);
        if (!(response instanceof Error) && response.length !== 0) {
            handleResponse(response);
        } else if (response.length === 0) {
            issuesList.innerHTML = '<p style="font-size: larger">No Results to show</p>';
        } else {
            handleError(response, 'Please try again', true);
        }
    } else if (status && !query && !priority) {
        let response = await request('GET', `/api/Issue/all?status=${status}&sort=newest`);
        if (!(response instanceof Error) && response.length !== 0) {
            handleResponse(response);
        } else if (response.length === 0) {
            issuesList.innerHTML = '<p style="font-size: larger">No Results to show</p>';
        } else {
            handleError(response, 'Please try again', true);
        }
    } else {
        issuesList.innerHTML = '<p style="font-size: larger">Please use at least one filter or the searchbar</p>';
    }
    loading = false;
}

function handleResponse(data) {
    if (data) {
        issuesList.innerHTML = '';
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
    } else {
        issuesList.innerHTML = '<p style="font-size: larger">No Results to show</p>';
    }
}

// Main Function
document.addEventListener('DOMContentLoaded', () => {
    searchArea.addEventListener('submit', (e) => {
        e.preventDefault();
        updateList().then().catch((error) => {
            handleError(error, error.message, true);
        });
    });

    document.querySelector('#search-button').addEventListener('click', (e) => {
        updateList().then().catch((error) => {
            handleError(error, error.message, true);
        });
    });
    
    searchArea.querySelector('#priority-filter').addEventListener('change', (e) => {
        updateList().then().catch((error) => {
            handleError(error, error.message, true);
        });
    });
    
    searchArea.querySelector('#status-filter').addEventListener('change', (e) => {
        updateList().then().catch((error) => {
            handleError(error, error.message, true);
        });
    });
    
    searchArea.querySelector('#search-query').addEventListener('input', (e) => {
        updateList().then().catch((error) => {
            handleError(error, error.message, true);
        });
    });
    
});
