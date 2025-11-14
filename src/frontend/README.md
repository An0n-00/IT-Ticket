<div align="center">
   
# IT-Ticket Frontend

The frontend project for the IT-Ticket system - a comprehensive IT ticket management solution built with [Vite + TypeScript](//vite.dev), [Tailwind](//tailwindcss.com), [Shadcn](//ui.shadcn.com) and some other technologies and packages you can find in the [`package.json`](./package.json)

</div>

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Authentication](#authentication)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Overview

The IT-Ticket frontend provides a intuitive, sleek and modern website to manage your tickets, notifications and user base. It's designed to handle enterprise-level ticket management with comprehensive security features through efficient and light weight code.

## Features

- **User Management**: Registration, authentication, role-based access control
- **Issue Tracking**: Create, update, assign, and resolve tickets
- **Comment System**: Threaded comments with reply functionality
- **Notification System**: Real-time notifications for users
- **Audit Logging**: Comprehensive audit trail with suspicious activity detection
- **Tag System**: Categorize issues with custom tags
- **Priority & Status Management**: Flexible priority and status workflows
- **Security Features**: JWT authentication, input validation, SQL injection prevention
- **Admin Panel**: Administrative functions for user and system management

## Technology Stack

- **Build Tool**: [Vite](//vite.dev)
- **Language**: TypeScript
- **Styling**: [Tailwind](//tailwindcss.com)
- **Component Library**: [Shadcn](//ui.shadcn.com)

## Prerequisites

- [`Node.js`](//nodejs.com)
    - `Node Package Manager`
- [The Backend](../backend/)

## Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/An0n-01/IT-Ticket.git
    cd IT-Ticket/src/frontend
    ```

2. **Install Node Packages**

    ```bash
    npm i
    ```

3. **Run the Project**

> [!CAUTION]
> Do not skip the [`configuring`](#configuration). It won't work propperly otherwise. Also make sure that the backend and database is running and accessable.

    ```bash
    npm run dev
    ```

4. **Build the project** (Deployment)
    ```bash
    npm run build
    cd ./dist/ #In that folder you will find the output files. Those can be hosted with nginx or any other webserver you preffer
    ```

## Configuration

1. **Rename the .env.example to .env**

    ```bash
    cp .env.example .env
    ```

2. **Update the .env file if required** ([`.env`](./.env.example))
    - If you are hosting the backend on a different URL then `http://localhost:3001`, you will have to change that in the `.env` **before** building/running it.

> [!CAUTION]
> This is a popular mistake. Configure the `.env` before running the project. Otherwise it won't work.

## Running the Application

After configuring the `.env` you can run the project like this:

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
```

The frontend will be available at [`http://localhost:3000`](//localhost:3000), unless you changed something.

## Authentication

The API requires a JWT Bearer token to authenticate. To get such a token, you can easily register/login with your credentials and everything will be taken care of.

> [!CAUTION]
> **⚠️ Incase you have not changed the default password of the admin account, DO THAT!**

## Project Structure

```
src/
├── Components/           # Components
│   ├── ui/               # Shadcn components
│   ├── auth/             # Components used for authentication things (i.e. Login/Register form)
│   ├── sidebar/          # Sidebar components
│   └── ...
├── pages/                # The pages of the site (i.e. 404, Homepage, Login, Dashboard, etc...)
│   ├── 404/
│   └── Main/
│   └── ...
├── context/               # Typescript contexts (for example authentication context)
├── types/                 # Typescript types
├── lib/                   # Contains the API library. A centralized API requester
.env                       # Configuration
index.html                 # Application entry point
.prettierc                 # Prettier config
```

## Development

### Code Style

- This project utilzes prettier for a standardized code style.
- Indentions in **4** spaces
- Use the correct folders for whatever you are adding.

## Contributing

1. Check if such a feature already exists
2. If not create an issue to discuss the feature
3. If it gets approved, fork the repository and checkout the feature branch
4. Commit your changes
5. Push to the branch (`git push origin <branch-name>`)
6. Create a Pull Request

### Contribution Guidelines

- Follow existing code style and patterns
- Add appropriate error handling

## Support

For support and questions:

- Create an issue on GitHub
- Check the API documentation
- Review the audit logs for troubleshooting

---

**Note**: This is the fronted component. For the complete system setup, refer to [the main README](../../README.md). For the backend, system setup, reffer to [the backend README](../backend/README.md).
