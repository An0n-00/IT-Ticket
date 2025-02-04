'use strict';

//Non Document dependent function calls:
checkToken('redirectToDashboard',null);

/*
# login.js

Purpose:
- This file shall be loaded on the login page only. It contains the logic only for that.
*/


//Constants:
const loginForm = document.querySelector('#login-form');
const apiLoginPath = '/auth/api/user/login';

//Functions:
function addEventToForm() {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login()
            .catch((error) => handleError(error, error.message, true));
    });
}

async function login() {
    let hashedPassword = await hashPassword(document.querySelector('#login-password-field').value);
    let data = {
        'username': `${document.querySelector('#login-username-field').value}`,
        'password': hashedPassword
    }
    
    let response = await request('POST', apiLoginPath, data);
    if (!(response instanceof Error)) {
        handleResponse(response);
    } else if ((response instanceof Error)) {
        handleError(response, response.message, false);
    }
}

function handleResponse(data) {
    if (data.jwt !== null) {
        localStorage.setItem('token', data.jwt);
        localStorage.setItem('username', data.username);
        localStorage.setItem('role', data.role);
        redirectToSite('/pages/dashboard');
    } else {
        handleError(new Error("Backend is not configured properly."), 'Invalid response from server', true);
    }
}

// Main Function
document.addEventListener('DOMContentLoaded', () => {
    addEventToForm();
});