'use strict';

//Non Document dependent function calls:
checkToken('redirectToDashboard',null);

/*
# register.js

Purpose:
- This file shall be loaded on the register page only. It contains the logic only for that.
*/


//Constants:
const registerForm = document.querySelector('#register-form');
const apiregisterPath = '/auth/api/user/register';

//Functions:
function addEventToForm() {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (formValidation()) { //only continue if form is valid (true)
            register().catch((err) => {
                handleError(err, null, true);
            });
        }
    });
}

function formValidation() {
    let password = document.querySelector('#register-password-field');
    let passwordConfirmation = document.querySelector('#register-confirm-password-field');
    let username = document.querySelector('#register-username-field');
    
    if (password.value !== passwordConfirmation.value) {
        handleError(new Error('Passwords do not match'), 'Please make sure your passwords match', false);
        return false;
    }
    
    if (password.value.length < 8) {
        handleError(new Error('Password too short'), 'Please make sure your password is at least 8 characters long', false);
        return false;
    }
    
    // look for spaces in username
    if (username.value.includes(' ')) { 
        handleError(new Error('Username contains spaces'), 'Please make sure your username does not contain spaces', false);
        return false;
    }
    
    return true;
}

async function register() {
    let hashedPassword = await hashPassword(document.querySelector('#register-password-field').value);
    
    let data = {
        'email': `${document.querySelector('#register-email-field').value}`,
        'username': `${document.querySelector('#register-username-field').value}`,
        'firstname': `${document.querySelector('#register-first-name-field').value}`,
        'lastname': `${document.querySelector('#register-last-name-field').value}`,
        'password': hashedPassword
    }
    
    let response = await request('POST', apiregisterPath, data);
    
    if (!(response instanceof Error)) {
        handleResponse(response);
    } else {
        handleError(response, response.message, false);
    }
}

function handleResponse(data) {
    if (data.jwt !== null) {
        localStorage.setItem('token', data.jwt);
        localStorage.setItem('username', data.username);
        redirectToSite('/pages/dashboard');
    } else {
        handleError(new Error("Backend is not configured properly."), 'Invalid response from server', true);
    }
}

// Main Function
document.addEventListener('DOMContentLoaded', () => {
    addEventToForm();
});