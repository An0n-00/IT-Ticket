'use strict';

//Non Document dependent function calls:
//On every site with according action (redirectToLogin|redirectToDashboard|null)
checkToken(null, 'redirectToLogin');

/*
# settings.js

Purpose:
- This file is for the settings page.
*/

//Constants:
let logoutButton = document.querySelector('#sidebar-logout');
let deleteAccountButton = document.querySelector('#sidebar-deleteme');
let firstnameElement = document.querySelector('#firstname');
let lastnameElement = document.querySelector('#lastname');
let emailElement = document.querySelector('#email');
let usernameElement = document.querySelector('#username');
let uid = localStorage.getItem('UserId');
let settingsForm = document.querySelector('#settings-form');


//Functions:
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('UserId');
    redirectToSite('/');
}

async function deleteUser() {
    let response = request('DELETE', `/auth/api/user/${uid}`);
    response = await response;
    if (!(response instanceof Error)) {
        notifyUser('User deleted successfully');
        logout();
    } else {
        handleError(response, 'Failed to delete user', true);
    }
}

async function fillInData() {
    usernameElement.value = localStorage.getItem('username');
    let user = request('GET', `/auth/api/user/${uid}`);
    user = await user;
    if (user instanceof Error || user === false) {
        handleError(user, 'Failed to load user data', true);
    } else {
        firstnameElement.value = user.firstname;
        lastnameElement.value = user.lastname;
        emailElement.value = user.email;
        usernameElement.value = user.username;
    }
}

async function updateUser() {
    let data = {
        firstname: firstnameElement.value,
        lastname: lastnameElement.value,
        username: usernameElement.value,
        email: emailElement.value
    };
    
    let response = request('PUT', `/auth/api/user/${uid}`, data);
    response = await response;
    if (!(response instanceof Error) || response === true) {
        notifyUser('Information updated successfully');
        setTimeout(() => {
            location.reload();
        }, 3000);
    } else {
        handleError(response, 'Failed to update user', true);
    }
}

// Main Function
document.addEventListener('DOMContentLoaded', () => {
    fillInData().then();
    
    logoutButton.addEventListener('click', async () => {
        let confirmation = confirmAction('Are you sure you want to log out?', 'Log out', 'Cancel');
        confirmation = await confirmation;
        if (confirmation) {
            logout();
        }
    });
    
    deleteAccountButton.addEventListener('click', async () => {
        let confirmation = confirmAction('Are you sure you want to delete your account?<br><span style="font-weight: bold; color: red;">This action cannot be undone!</span>', 'Delete account', 'Cancel');
        confirmation = await confirmation;
        if (confirmation) {
            notifyUser('Was nice knowing you!');
            await deleteUser();
        }
    });
    
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (usernameElement.value.includes(' ')) {
            handleError(new Error('Username cannot contain spaces'), 'Username cannot contain spaces', false);
        } else {
            updateUser();
        }
    });
    
});
