'use strict';
/*
# Index.js

Purpose:
- This file shall be loaded on all pages of the website.
- This file shalql contain all the common scripts that are required on all pages.
*/

//Constants:

//Functions:
function redirectToSite(site) {
    location.href = site;
    return true;
}

function addEventToHeaderButton(isLoggedIn) {
    let headerButton = document.querySelector('#header-button');
    let aElementHeaderLeft = document.querySelector('header .left a');
    if (headerButton === null || aElementHeaderLeft === null) {
        handleError(Error("Did not find Buttons!"), 'Please reload the page', true);
    }
    
    if (isLoggedIn) {
        headerButton.innerHTML = 'Dashboard';
        headerButton.addEventListener('click', () => {redirectToSite('/pages/dashboard')})
        aElementHeaderLeft.attributes.href.value = '/pages/dashboard';
    } else {
       headerButton.innerHTML = 'Login';
       headerButton.addEventListener('click', () => redirectToSite('/auth/login'));
    }
}

async function verifyToken(token) {
    try {
        const response = await fetch('/auth/api/token', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-cache',
            method: 'POST',
        });
        if (response.status === 200) {
            const data = await response.json();
            localStorage.setItem('role', data.role)
            localStorage.setItem('UserId', data.userId)
            return true;
        } 
        
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

//Note to self: call this function on every non-public site under 'Non Document dependent function calls:' (all the way at the top)
async function checkToken(doWhatIfValid, doWhatIfInvalid) {
    let token = localStorage.getItem('token');
    if (token === null) {
        switch (doWhatIfInvalid) {
            case 'redirectToLogin':
                handleInvalidToken('redirectToLogin');
                break;
            default:
                return false;
        }
    } else {
        let verified = await verifyToken(token);
        if (verified) {
            addEventToHeaderButton(true)
            switch (doWhatIfValid) {
                case 'redirectToDashboard':
                    redirectToSite('/pages/dashboard');
                    break;
                default:
                    return true;
            }
        } else {
            switch (doWhatIfInvalid) {
                case 'redirectToLogin':
                    handleInvalidToken('redirectToLogin');
                    break;
                default:
                    return false;
            }
        }
    }
}

function handleInvalidToken(doWhat) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('UserId');
    localStorage.removeItem('userName');
    switch (doWhat) {
        case 'redirectToLogin':
            redirectToSite('/auth/login');
            break;
        default:
            return false;
    }
}

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

//Note to self: Returns data from the server or false if an error occurred client side
async function request(method, url, body) {
    let token = localStorage.getItem('token');
    let headers;
    let init;
    if (token === null) {
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
    } else {
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    if (body) {
        let jsonBody = JSON.stringify(body);
        init = {
            headers,
            cache: 'no-cache',
            method: method,
            body: jsonBody
        }
    } else {
        init = {
            headers,
            cache: 'no-cache',
            method: method
        }
    }

    try {
        const response = await fetch(url, init);
        let data;
        try {
            data = await response.json();
        } catch (e) {
        }
        if (response.status !== 200) {
            let backendMessage;
            try {
                backendMessage = data.message;
            } catch (e) {
            }
            if (backendMessage !== undefined) {
                return new Error(data.message);
            } else {
                return new Error('Strange response from server 🤨');
            }
        } else {
            if (data !== undefined) {
                return data;
            }
            return true;
        }
    } catch (error) {
        handleError(error, 'Strange response from server 🤨', true);
        return false;
    }
}

function updatePriorityColor(selectElement) {
    let priority = selectElement.value.toLowerCase().replace(' ', '-');
    selectElement.style.color = 'white';
    if (priority === "") {
        selectElement.style.backgroundColor = '#E8E8E8';
        selectElement.style.color = 'black';
    } else if (priority === 'low') {
        selectElement.style.backgroundColor = 'green';
    } else if (priority === 'medium') {
        selectElement.style.backgroundColor = 'orange';
    } else if (priority === 'high') {
        selectElement.style.backgroundColor = 'red';
    }
}

function updateStatusColor(selectElement) {
    let status = selectElement.value.toLowerCase().replace(' ', '-');
    selectElement.style.color = 'white';
    if (status === "") {
        selectElement.style.backgroundColor = '#E8E8E8';
        selectElement.style.color = 'black';
    } else if (status === 'open') {
        selectElement.style.backgroundColor = 'green';
    } else if (status === 'in-progress') {
        selectElement.style.backgroundColor = 'orange';
    } else if (status === 'closed') {
        selectElement.style.backgroundColor = 'red';
    }
}

function handleError(err, msg, defaultTxt) {
    console.error(err);
    let element = document.createElement('div');
    if (element) {
        element.classList.add('errorArea');
        if (msg && defaultTxt) {
            element.innerHTML = 'Whoops we ran into an Error😿<br><span style="font-size: small">'+ msg + '</span>';
        } else if (msg && !defaultTxt) {
            element.innerHTML = msg;
        } else {
            element.innerText = 'Whoops we ran into an Error😿. Try again later';
        }
        element.style.display = 'flex';
        element.style.flexDirection = 'column';
        element.style.alignItems = 'center';
        element.innerHTML += '<br><div style="font-size: xx-small; text-align: center; width: 100%">Click Me :]</div>';
        
        document.body.appendChild(element);
        
        element.addEventListener('click', () => {
            element.classList.add('pushUp');
            setTimeout(() => {
                element.remove();
            }, 500);
        });
        
        setTimeout(() => {
            element.classList.add('pushUp');
            setTimeout(() => {
                element.remove();
            }, 500);
        }, 6500);
        
    } else {
        console.error('Failed to create error element');
    }
}

function notifyUser(msg) {
    let element = document.createElement('div');
    if (element) {
        element.classList.add('notificationArea');
        element.innerText = msg;
        element.style.display = 'flex';
        element.style.flexDirection = 'column';
        element.style.alignItems = 'center';
        element.innerHTML += '<br><div style="font-size: xx-small; text-align: center; width: 100%">Click Me :]</div>';
        
        document.body.appendChild(element);
        
        element.addEventListener('click', () => {
            element.classList.add('pushUp');
            setTimeout(() => {
                element.remove();
            }, 500);
        });
        
        setTimeout(() => {
            element.classList.add('pushUp');
            setTimeout(() => {
                element.remove();
            }, 500);
        }, 4000);
        
    } else {
        console.error('Failed to create notification element');
    }
}

function confirmAction(msg, actionTrue, actionFalse) {
    return new Promise((resolve) => {
        let element = document.createElement('div');
        if (element) {
            element.classList.add('confirmationArea');
            element.innerHTML = msg;
            element.style.display = 'flex';
            element.style.flexDirection = 'column';
            element.style.alignItems = 'center';
            element.innerHTML += `
                                    <div style="width: 100%" class="flex-center">
                                        <button id="actionTrue" style="margin-top: 10px">${actionTrue}</button>
                                        <button id="actionFalse" style="margin-top: 10px">${actionFalse}</button>
                                    </div>`;
            
            document.body.appendChild(element);
            
            document.querySelector('#actionTrue').addEventListener('click', () => {
                element.classList.add('pushUp');
                setTimeout(() => {
                    element.remove();
                    resolve(true);
                }, 500);
            });
            
            document.querySelector('#actionFalse').addEventListener('click', () => {
                element.classList.add('pushUp');
                setTimeout(() => {
                    element.remove();
                    resolve(false);
                }, 500);
            });
        } else {
            console.error('Failed to create confirmation element');
            resolve(false);
        }
    });
}

function getURLParam(paramName) {
    const params = new URLSearchParams(window.location.search);
    if (params.get(paramName)) {
        return params.get(paramName);
    } else {
        return new Error("Requested parameter not found");
    }
}

// Main Function
document.addEventListener('DOMContentLoaded', () => {
    addEventToHeaderButton();
});