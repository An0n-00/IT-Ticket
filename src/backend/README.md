<div align="center">
   
# IT-Ticket Backend

The backend API for the IT-Ticket system - a comprehensive IT ticket management solution built with ASP.NET Core 8.0.

</div>

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Project Structure](#project-structure)
- [Development](#development)
- [Security](#security)
- [Contributing](#contributing)

## Overview

The IT-Ticket backend provides a RESTful API for managing IT support tickets, user authentication, role-based access control, audit logging, and notification systems. It's designed to handle enterprise-level ticket management with comprehensive security features.

## Features

- **User Management**: Registration, authentication, role-based access control
- **Issue Tracking**: Create, update, assign, and resolve tickets
- **Comment System**: Threaded comments with reply functionality
- **Notification System**: Real-time notifications for users
- **Audit Logging**: Comprehensive audit trail with suspicious activity detection
- **File Attachments**: Support for file uploads on issues and comments [in development]
- **Tag System**: Categorize issues with custom tags
- **Priority & Status Management**: Flexible priority and status workflows
- **Security Features**: JWT authentication, input validation, SQL injection prevention
- **Admin Panel**: Administrative functions for user and system management

## Technology Stack

- **Framework**: ASP.NET Core 8.0
- **Database**: SQL Server with Entity Framework Core 9.0
- **Authentication**: JWT Bearer tokens
- **ORM**: Entity Framework Core
- **Architecture**: REST API with controller-based routing
- **Security**: Role-based authorization, audit logging, input validation

## Prerequisites

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (or SQL Server Express or Docker [recommended])
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [Visual Studio Code](https://code.visualstudio.com/) or [Jetbrains Rider](https://www.jetbrains.com/rider/) for development

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/An0n-01/IT-Ticket.git
   cd IT-Ticket/src/backend
   ```

2. **Restore NuGet packages**
   ```bash
   dotnet restore
   ```

3. **Build the project**
   ```bash
   dotnet build
   ```

## Configuration

1. **Copy the example configuration**
   ```bash
   cp appsettings.json.example appsettings.json
   ```

2. **Update the configuration file** (`appsettings.json`)
   - Set your database connection string
   - Configure CORS origins for your frontend
   - Set a secure JWT signing key (minimum 64 characters)
   - Update the default admin password

### Example Configuration

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=IT-Ticket-db;User Id=sa;Password=YourSecurePassword;TrustServerCertificate=True;"
  },
  "Cors": {
    "Origins": ["http://localhost:3000"],
    "Headers": ["*"],
    "Methods": ["*"]
  },
  "Jwt": {
    "ValidIssuer": "IT-Ticket Issuer",
    "ValidAudience": "IT-Ticket Users",
    "IssuerSigningKey": "your-very-secure-64-character-minimum-key-here-for-production"
  },
  "DefaultAdminPassword": "SecureAdminPassword123!"
}
```

## Database Setup

The application uses Entity Framework Code First migrations. The database will be automatically created and seeded when you first run the application.

## Running the Application

Make sure that you have set up the [configuration](#configuration) correctly, that the database is running, and the connection string in `appsettings.json` is correctly configured.

### Development
```bash
dotnet run
```

### Production
```bash
dotnet run --environment Production
```

The API will be available at:
- HTTP: `http://localhost:3001`
- HTTPS: `https://localhost:3001`

## API Documentation

Find the whole API documentation in the [OpenApi.yaml file](./openapi.yaml).

The API follows RESTful conventions with the following base structure:

### Authentication Endpoints
- `POST /auth/api/login` - User login
- `POST /auth/api/register` - User registration

### Protected Endpoints (Require JWT Token)
- `/api/user/*` - User management
- `/api/issue/*` - Issue tracking
- `/api/comment/*` - Comment management
- `/api/notification/*` - Notification system
- `/api/tag/*` - Tag management
- `/api/status/*` - Status management
- `/api/priority/*` - Priority management
- `/api/role/*` - Role management
- `/api/auditlog/*` - Audit log access

### Example API Calls

**Login**
```bash
curl -X POST http://localhost:3001/auth/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Administrator","password":"admin123"}'  
```
> [!CAUTION]
> This is actually the default admin user and password, you **should** change the username and password in `appsettings.json`.

**Create Issue**
```bash
curl -X POST http://localhost:3001/api/issue \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Login Issue","description":"Users cannot log in"}'
```

> [!NOTE]
> Check what fields are required for the issue creation in the [OpenApi.yaml file](./openapi.yaml).

## Authentication

The API uses JWT Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...
```

### Default Users

The system creates default users on first run:
- **Admin**: `Administrator` / `admin123` (or your configured password)
For any additional users, you can register via the API.

> [!CAUTION]
> **⚠️ Change these passwords in production!**

## Project Structure

```
src/backend/
├── Controllers/           # API controllers
│   ├── AuthController.cs
│   ├── UserController.cs
│   ├── IssueController.cs
│   └── ...
├── Data/                  # Database context and models
│   ├── Context.cs
│   └── Models/
├── DTOs/                  # Data Transfer Objects
├── Helpers/               # Utility classes
├── Migrations/            # EF Core migrations
├── appsettings.json       # Configuration
└── Program.cs             # Application entry point
```

## Development

### Code Style
- Follow C# naming conventions
- Use XML documentation for public APIs
- Implement proper error handling with `ControlledException`
- Add audit logging for sensitive operations

### Adding New Features
1. Create/update entity models in `Data/Models/`
2. Add database migrations if needed
3. Create DTOs for data transfer
4. Implement controller endpoints
5. Add proper authorization attributes
6. Update this documentation

## Security

### Security Features
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Admin, Support, and User roles
- **Input Validation**: Comprehensive validation and sanitization
- **Audit Logging**: Track all user actions with suspicious activity scoring
- **SQL Injection Prevention**: Entity Framework parameterized queries
- **CORS Configuration**: Configurable cross-origin resource sharing (see [appsettings.json](./appsettings.json))
- **Password Hashing**: Secure password storage with salt

### Security Best Practices
- Use HTTPS in production
- Set a strong JWT signing key (64+ characters)
- Regularly rotate JWT signing keys
- Monitor audit logs for suspicious activity
- Keep dependencies updated
- Use environment variables for sensitive configuration

### Audit Logging
The system automatically logs:
- User authentication attempts
- Data modifications
- Permission violations
- Suspicious activities (scored 0-5)

## Contributing

1. Check if such a feature already exists
2. If not create an issue to discuss the feature
3. If it gets approved, fork the repository and checkout the feature branch
4. Commit your changes
5. Push to the branch (`git push origin <branch-name>`)
6. Create a Pull Request

### Contribution Guidelines
- Follow existing code style and patterns
- Add appropriate error handling and logging
- Update documentation for API changes
- Ensure all endpoints have proper authorization
- Add audit logging for sensitive operations

## Support

For support and questions:
- Create an issue on GitHub
- Check the API documentation
- Review the audit logs for troubleshooting

---

**Note**: This is the backend API component. For the complete system setup, refer to the main repository README. For the frontend, system setup, reffer to the frontend repository README.
