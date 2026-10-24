# Sastagram

A full-stack social media application built with React, ASP.NET Core, and PostgreSQL.

Sastagram is a software engineering project designed to explore full-stack application development, REST API design, backend services, database integration, and authentication. The project separates the frontend interface from backend processing and persistent data storage.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)
- [Author](#author)
- [License](#license)

## Overview

Sastagram follows a client–server architecture in which a React frontend communicates with an ASP.NET Core backend over HTTP. The backend processes application requests and uses PostgreSQL for persistent data storage.

The repository is organised into two main applications:

- **Frontend:** A React application developed using Vite.
- **Backend:** An ASP.NET Core application written in C#.

The backend includes controllers for authentication, posts, users, comments, stories, and notifications, alongside data-access, model, DTO, and service layers.

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| Vite | Frontend development server and build tooling |
| JavaScript | Frontend application development |
| C# | Backend application development |
| ASP.NET Core | Backend API and request handling |
| PostgreSQL | Relational database |
| Entity Framework Core | Database access and schema migrations |
| JWT-related services | Token-based authentication functionality |
| Git and GitHub | Version control and source-code hosting |

Additional dependencies and versions are defined in the frontend `package.json` and backend `Sastagram.csproj` files.

## Features

The repository contains implementation areas for the following functionality. The exact supported operations should be confirmed against the corresponding controllers and frontend components.

- **Authentication:** Authentication-related API operations and token services.
- **Posts:** Backend operations related to posts.
- **User management:** User-related API operations.
- **Comments:** Backend functionality related to comments.
- **Stories:** Backend functionality related to stories.
- **Notifications:** Backend functionality related to notifications.
- **Database integration:** PostgreSQL access through Entity Framework Core.
- **Media handling:** A dedicated backend media service.

Refer to the API reference and source code for the exact endpoints, supported operations, and authentication requirements.

## Architecture

At a high level, Sastagram uses the following request flow:

```text
User
  |
  v
React Frontend (Vite)
  |
  | HTTP requests
  v
ASP.NET Core Backend
  |
  +--> Controllers
  |
  +--> Services
  |
  +--> Entity Framework Core
             |
             v
        PostgreSQL
```

The frontend manages the user interface, the backend handles HTTP requests and application processing, and PostgreSQL stores persistent application data.

Not every request necessarily passes through every component. The precise flow depends on the endpoint being used.

For a more detailed explanation, see [Architecture Documentation](docs/architecture.md).

## Project Structure

```text
Sastagram/
├── README.md
├── Sastagram.sln
├── docs/
│   ├── installation.md
│   ├── api-reference.md
│   ├── architecture.md
│   └── troubleshooting.md
├── backend/
│   └── Sastagram/
│       ├── Controllers/
│       │   ├── AuthController.cs
│       │   ├── CommentsStoriesNotificationsController.cs
│       │   ├── PostsController.cs
│       │   └── UsersController.cs
│       ├── Data/
│       │   └── ApplicationDbContext.cs
│       ├── DTOs/
│       │   └── Dtos.cs
│       ├── Migrations/
│       ├── Models/
│       ├── Properties/
│       ├── Services/
│       │   ├── MediaService.cs
│       │   └── TokenService.cs
│       ├── Program.cs
│       ├── appsettings.json
│       └── Sastagram.csproj
└── frontend/
    └── Sastagram/
        ├── src/
        │   ├── components/
        │   ├── pages/
        │   ├── services/
        │   └── store/
        ├── README.md
        ├── package.json
        └── vite.config.js
```

This is a simplified representation of the repository; additional files and folders may exist.

## Getting Started

Follow the installation guide for complete setup instructions, configuration requirements, database preparation, and troubleshooting.

### Prerequisites

Before running the project, ensure you have:

- Git
- Visual Studio Code or another compatible editor
- A .NET SDK compatible with the backend target framework
- Node.js and npm compatible with the frontend dependencies
- PostgreSQL

### 1. Clone the repository

Replace the repository URL below with the HTTPS URL from your GitHub repository.

```bash
git clone <repository-url>
cd Sastagram
```

### 2. Configure the backend

Open a terminal in the backend project directory:

```bash
cd backend/Sastagram
```

Restore dependencies and build the project:

```bash
dotnet restore
dotnet build
```

Configure the database connection and other required application settings before starting the backend.

### 3. Prepare the database

Ensure PostgreSQL is running and the configured database exists.

If the project uses Entity Framework Core migrations to initialise the database schema, run the following from the backend project directory:

```bash
dotnet ef database update
```

This command requires compatible Entity Framework Core tooling and a valid database configuration.

### 4. Start the backend

From `backend/Sastagram/`, run:

```bash
dotnet run
```

Use the URL printed in the terminal to identify the backend address and port.

### 5. Start the frontend

Open a second terminal and navigate to the frontend project:

```bash
cd frontend/Sastagram
```

Install the frontend dependencies and start Vite:

```bash
npm install
npm run dev
```

Open the local URL displayed in the terminal.

**Important:** The backend and frontend must be configured to communicate with each other. Check the Vite proxy configuration and backend launch settings if API requests fail.

For the complete instructions, see [Installation Guide](docs/installation.md).

## Configuration

Sastagram may require environment-specific configuration for database access, authentication, and media handling.

Before running the application, verify the required settings in the backend configuration and service implementations.

Typical configuration areas include:

| Configuration area | Purpose |
|---|---|
| Database connection | Connects the backend to PostgreSQL |
| JWT settings | Configures token-related functionality |
| Media-service settings | Configures media-related integrations, if required |
| Frontend API configuration | Determines how frontend requests reach the backend |

The exact configuration keys depend on the implementation.

Do not commit real passwords, JWT signing keys, API keys, or other sensitive credentials to GitHub. Use an appropriate local or environment-specific secret-management mechanism.

## API Documentation

The backend exposes API endpoints through ASP.NET Core controllers.

See the [API Reference](docs/api-reference.md) for endpoint documentation, request conventions, authentication information, and response details.

The endpoint reference should be kept aligned with the actual controller routes, DTOs, and runtime behaviour.

## Testing

When validating a local setup, use the following basic checklist:

- [ ] The backend restores and builds successfully.
- [ ] The backend starts without configuration errors.
- [ ] PostgreSQL is reachable using the configured connection.
- [ ] Required database migrations have been applied.
- [ ] The frontend starts successfully.
- [ ] The frontend can reach the backend.
- [ ] Authentication-related flows behave as expected.
- [ ] API responses and error handling have been checked.

These are recommended verification steps, not a claim that an automated test suite is currently included.

## Security Considerations

When developing or deploying Sastagram:

- Keep credentials and signing keys out of source control.
- Validate request data on the backend.
- Verify authentication and authorization requirements for individual endpoints.
- Avoid exposing passwords, tokens, or other sensitive data in logs.
- Review database permissions and production configuration.
- Verify media-upload validation and access controls if media uploads are supported.
- Test access restrictions instead of assuming that authentication alone provides authorization.

Security behaviour should be confirmed against the current implementation before making claims about the application's protections.

## Troubleshooting

For common setup and runtime problems, see the [Troubleshooting Guide](docs/troubleshooting.md).

Common areas to investigate include:

- .NET SDK and target framework compatibility
- PostgreSQL connection failures
- Entity Framework Core migration errors
- Frontend dependency installation
- Backend port conflicts
- Frontend-to-backend connectivity
- Authentication and API response errors

When reporting an issue, include the relevant error message and reproduction steps. Remove credentials and tokens from logs before sharing them.

## Future Improvements

Potential areas for further development include:

- Expanding automated backend and frontend tests.
- Documenting verified database relationships with an entity-relationship diagram.
- Adding or documenting an OpenAPI/Swagger specification, if supported.
- Improving consistency in API error responses.
- Reviewing authentication and authorization coverage.
- Documenting deployment and production configuration.
- Adding continuous integration checks for builds and tests.

These are potential improvements rather than features guaranteed to be implemented.

## Author

**Muskan Gill**

Software Engineering student interested in full-stack development, backend engineering, and technical documentation.

GitHub: [muskangillpvt](https://github.com/muskangillpvt)

## License

No license information is specified in this document. Add a license section once the repository's intended licensing terms have been chosen and a corresponding license file has been added if required.
