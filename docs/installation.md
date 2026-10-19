# Sastagram Installation and Setup Guide

This guide explains how to configure and run Sastagram in a local development environment on Windows.

Sastagram is a full-stack social media web application consisting of a React frontend, an ASP.NET Core Web API backend, and a PostgreSQL database.

Follow the sections in order to install the required tools, configure the database, start the backend, and launch the frontend.

## Table of Contents

- [1. Prerequisites](#1-prerequisites)
- [2. Clone the Repository](#2-clone-the-repository)
- [3. Verify the Project Configuration](#3-verify-the-project-configuration)
- [4. Set Up PostgreSQL](#4-set-up-postgresql)
- [5. Configure Backend Secrets](#5-configure-backend-secrets)
- [6. Apply Database Migrations](#6-apply-database-migrations)
- [7. Start the Backend](#7-start-the-backend)
- [8. Start the Frontend](#8-start-the-frontend)
- [9. Verify the Installation](#9-verify-the-installation)
- [10. Troubleshooting](#10-troubleshooting)
- [11. Stop the Application](#11-stop-the-application)

## 1. Prerequisites

Install the following software before starting the application.

| Software | Purpose |
|---|---|
| Git | Downloads the repository and manages source code changes. |
| Visual Studio Code | Provides an editor and integrated terminal. |
| .NET SDK | Restores, builds, and runs the ASP.NET Core backend. |
| Node.js and npm | Runs the React frontend and installs JavaScript dependencies. |
| PostgreSQL | Stores application data. |

### 1.1 Git

Download and install Git from [Git for Windows](https://git-scm.com/downloads/win).

Verify the installation in a PowerShell terminal:

```powershell
git --version
```

The command should display the installed Git version.

### 1.2 .NET SDK

Download the .NET SDK from [Download .NET](https://dotnet.microsoft.com/en-us/download).

The required SDK version depends on the target framework specified in `backend/Sastagram/Sastagram.csproj`. Open that file and check its `<TargetFramework>` element before choosing an SDK.

Verify the installation:

```powershell
dotnet --info
dotnet --list-sdks
```

Make sure a compatible SDK is installed. The .NET SDK includes the command-line tools needed to restore, build, and run the backend.

### 1.3 Node.js and npm

Install a supported Node.js LTS release from [Node.js](https://nodejs.org/en/download).

npm is included with the standard Node.js installation.

Verify both tools:

```powershell
node --version
npm --version
```

### 1.4 PostgreSQL

Download PostgreSQL from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/).

During installation, note the following details:

- Database server host, normally `localhost` for local development.
- Port, normally `5432`.
- PostgreSQL username.
- Password configured during installation.

These values will be used to configure the backend database connection.

### 1.5 Visual Studio Code

Install VS Code from [Visual Studio Code](https://code.visualstudio.com/).

Open the integrated terminal using **Terminal → New Terminal**. The commands in this guide use PowerShell.

## 2. Clone the Repository

### 2.1 Copy the repository URL

1. Open the Sastagram repository on GitHub.
2. Select **Code**.
3. Select **HTTPS**.
4. Copy the repository URL.

### 2.2 Clone the repository

Open PowerShell and navigate to the directory where you want to keep your projects. For example:

```powershell
cd $HOME\Documents
```

Clone the repository using the URL copied from GitHub:

```powershell
git clone <repository-url>
```

Replace `<repository-url>` with the actual HTTPS URL.

Move into the cloned repository:

```powershell
cd muskangillpvt-sastagram
```

Open the folder in VS Code:

```powershell
code .
```

If the `code` command is unavailable, open VS Code and select **File → Open Folder** instead.

### 2.3 Confirm the repository structure

The repository should contain the following main files and directories:

```text
muskangillpvt-sastagram/
├── README.md
├── Sastagram.sln
├── backend/
│   └── Sastagram/
│       ├── Controllers/
│       ├── Data/
│       ├── DTOs/
│       ├── Migrations/
│       ├── Models/
│       ├── Services/
│       ├── Program.cs
│       └── Sastagram.csproj
└── frontend/
    └── Sastagram/
        ├── package.json
        ├── vite.config.js
        └── src/
```

The backend and frontend run as separate development processes.

## 3. Verify the Project Configuration

Before starting the application, inspect the project configuration files.

| File | What to check |
|---|---|
| `backend/Sastagram/Sastagram.csproj` | Target framework and NuGet package dependencies. |
| `backend/Sastagram/Program.cs` | Database registration, authentication, middleware, and API configuration. |
| `backend/Sastagram/Properties/launchSettings.json` | Development launch profiles and application URLs. |
| `backend/Sastagram/appsettings.json` | Application configuration keys. Do not publish secret values. |
| `frontend/Sastagram/package.json` | npm scripts and frontend dependencies. |
| `frontend/Sastagram/vite.config.js` | Frontend development port and API proxy target. |

The Vite configuration currently specifies port `5173` and proxies requests beginning with `/api` to `http://localhost:5241`.

Confirm that the backend launch profile uses a compatible HTTP URL. If the backend port differs, update the Vite proxy configuration to match the actual backend URL.

## 4. Set Up PostgreSQL

Sastagram uses PostgreSQL through Entity Framework Core.

### 4.1 Start the PostgreSQL service

Ensure the PostgreSQL server is running on your computer.

On Windows, you can check the PostgreSQL service through the Windows Services application. The service name varies depending on the installed version.

### 4.2 Create the database

Create a database named `sastagram` using pgAdmin or the PostgreSQL command-line tools.

For example, using `psql` with a PostgreSQL account that has permission to create databases:

```sql
CREATE DATABASE sastagram;
```

If the database already exists, do not create it again.

### 4.3 Check database connectivity

Confirm the following values before configuring the backend:

- Host: `localhost`
- Port: `5432`, unless PostgreSQL uses a different port.
- Database: `sastagram`
- Username: your local PostgreSQL username.
- Password: the password associated with that account.

The backend must be able to connect to this database before database-dependent features can work.

## 5. Configure Backend Secrets

The backend reads its database connection string and other settings through ASP.NET Core configuration.

**Never commit real passwords, JWT signing keys, or Cloudinary API secrets to GitHub.** Use local development secrets for sensitive values.

### 5.1 Navigate to the backend project

In the VS Code terminal:

```powershell
cd backend/Sastagram
```

### 5.2 Initialise User Secrets

Initialise ASP.NET Core User Secrets for the backend project:

```powershell
dotnet user-secrets init
```

This associates a local secrets store with the project. The secrets are stored outside the repository and are intended for development use.

### 5.3 Configure the database connection string

Run the following command, replacing the username and password placeholders with your own local PostgreSQL credentials:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=sastagram;Username=YOUR_POSTGRES_USER;Password=YOUR_POSTGRES_PASSWORD"
```

Do not include angle brackets around the replacement values. If a password contains special characters, ensure the connection string is quoted and formatted correctly.

### 5.4 Configure JWT authentication

The backend requires JWT configuration for token-based authentication.

Set the secret key using a newly generated, sufficiently strong development-only value:

```powershell
dotnet user-secrets set "JwtSettings:SecretKey" "REPLACE_WITH_A_NEW_RANDOM_SECRET"
```

Use a securely generated secret that meets the application's signing requirements. Do not reuse a key exposed in source control.

The issuer, audience, and token expiration settings must also match the configuration expected by the application. Check the existing development configuration and `TokenService.cs` before changing them.

### 5.5 Configure Cloudinary for media features

The project contains a `MediaService.cs` service and Cloudinary configuration. If media uploads are required, create or use a Cloudinary account and obtain its development credentials from the Cloudinary dashboard.

Store the values locally:

```powershell
dotnet user-secrets set "Cloudinary:CloudName" "YOUR_CLOUDINARY_CLOUD_NAME"
dotnet user-secrets set "Cloudinary:ApiKey" "YOUR_CLOUDINARY_API_KEY"
dotnet user-secrets set "Cloudinary:ApiSecret" "YOUR_CLOUDINARY_API_SECRET"
```

These settings are needed only if the application requires Cloudinary to initialise or perform media operations. Confirm the exact requirements in `MediaService.cs`.

### 5.6 Verify the configuration

List the configured secret names and values using:

```powershell
dotnet user-secrets list
```

This command displays secret values, so do not share its output publicly or include it in documentation screenshots.

The application should obtain the local values through its normal ASP.NET Core configuration system. Do not commit the secrets store or copy its values into the repository.

## 6. Apply Database Migrations

Sastagram contains Entity Framework Core migration files under `backend/Sastagram/Migrations/`.

Migrations describe database schema changes and allow Entity Framework Core to create or update the database structure.

### 6.1 Install the Entity Framework Core CLI tool

Check whether the EF Core command-line tool is available:

```powershell
dotnet ef --version
```

If the command is unavailable, install the tool using a version compatible with the Entity Framework Core packages referenced by `Sastagram.csproj`:

```powershell
dotnet tool install --global dotnet-ef --version <compatible-version>
```

Replace `<compatible-version>` with the appropriate version. If the tool is already installed but incompatible, update it to a compatible version instead.

### 6.2 Restore backend dependencies

From the `backend/Sastagram` directory, run:

```powershell
dotnet restore
```

This restores the NuGet packages required by the backend project.

### 6.3 Apply the existing migrations

After configuring the database connection and confirming PostgreSQL is running, execute:

```powershell
dotnet ef database update
```

This applies the migrations included in the project to the configured database.

**Important:** Do not create a new migration merely to initialise an existing project. Use the migrations already included in the repository unless the data model has intentionally changed.

If the command fails, check the connection string, database permissions, installed EF Core tool version, and whether the project builds successfully.

## 7. Start the Backend

### 7.1 Restore and build the backend

From the `backend/Sastagram` directory, run:

```powershell
dotnet restore
dotnet build
```

Resolve any build errors before continuing.

### 7.2 Run the API

Start the backend:

```powershell
dotnet run
```

Read the terminal output to identify the actual listening URL. The URL depends on the active launch profile and configuration.

Keep this terminal open while using the application.

### 7.3 Check API availability

Open the backend URL in a browser or use an API client to make a request to an endpoint that exists in the current implementation.

If Swagger/OpenAPI is enabled, use the Swagger URL configured by the application. Do not assume that a particular Swagger route is available without checking `Program.cs`.

A successful startup confirms that the backend process is running; it does not, by itself, prove that every endpoint or database operation works.

## 8. Start the Frontend

Open a second VS Code terminal. Keep the backend running in the first terminal.

### 8.1 Navigate to the frontend

From the repository root:

```powershell
cd frontend/Sastagram
```

If the terminal is currently inside `backend/Sastagram`, return to the repository root first:

```powershell
cd ../..
cd frontend/Sastagram
```

### 8.2 Install frontend dependencies

Run:

```powershell
npm install
```

npm reads `package.json` and installs the dependencies needed to run the React application.

If a `package-lock.json` is present and committed, prefer `npm ci` for a reproducible installation based on the lockfile.

### 8.3 Start the Vite development server

Run:

```powershell
npm run dev
```

The terminal should display the local development URL. With the current Vite configuration, the expected URL is:

`http://localhost:5173`

Open that URL in your browser.

Keep this terminal open while using the frontend.

## 9. Verify the Installation

After starting both processes, perform the following checks.

### 9.1 Confirm the frontend loads

Open the Vite development URL and confirm that the Sastagram interface renders.

If the page is blank, inspect the browser's developer console for JavaScript errors.

### 9.2 Test authentication

If the relevant endpoints and UI are operational:

1. Open the registration page.
2. Create a development test account.
3. Sign in using the account.
4. Confirm that the application handles the authentication response correctly.

Use test data only. Do not use production credentials or real users' personal information.

### 9.3 Test API communication

Open the browser's developer tools and select the **Network** tab.

Perform an action that sends an API request, then inspect:

- The request URL.
- The HTTP method.
- The response status code.
- The response body, where appropriate.

The frontend's `/api` requests should be forwarded to the backend URL configured in `vite.config.js`.

### 9.4 Test database operations

If authentication or another feature accesses PostgreSQL, confirm that the operation completes successfully and that the expected database changes occur.

Review the backend terminal for connection errors or unhandled exceptions.

### 9.5 Run the frontend lint check

Stop neither process; open another terminal or use the frontend terminal after stopping Vite if necessary.

From `frontend/Sastagram`, run:

```powershell
npm run lint
```

This runs the ESLint command defined in `package.json`.

A successful lint check helps identify certain code-quality issues but does not replace functional testing.

## 10. Troubleshooting

### .NET SDK or target framework errors

**Symptom:** The backend fails to build because a target framework or SDK is unavailable.

**Resolution:**

1. Inspect the `<TargetFramework>` value in `Sastagram.csproj`.
2. Run `dotnet --list-sdks`.
3. Install a compatible SDK.
4. Restore the backend dependencies and rebuild.

### PostgreSQL connection errors

**Symptom:** The backend cannot connect to the database.

**Resolution:**

1. Confirm that PostgreSQL is running.
2. Verify the host and port.
3. Check the database name, username, and password.
4. Confirm that the database exists and the account has the required permissions.
5. Verify that the configured connection string is being loaded.

### Entity Framework Core command errors

**Symptom:** `dotnet ef` is not recognised or migrations cannot be applied.

**Resolution:**

1. Check `dotnet ef --version`.
2. Install a compatible EF Core CLI version if necessary.
3. Run `dotnet restore`.
4. Confirm that the backend project builds.
5. Check database connectivity and permissions before retrying the migration command.

### Frontend dependency errors

**Symptom:** `npm install` or `npm run dev` fails.

**Resolution:**

1. Confirm that Node.js and npm are installed.
2. Run `node --version` and `npm --version`.
3. Check that the terminal is in `frontend/Sastagram`.
4. Review the error output for dependency or version conflicts.
5. If a lockfile is present, use the appropriate installation command for that lockfile.

### API requests fail

**Symptom:** The frontend loads, but API-driven features do not work.

**Resolution:**

1. Confirm that the backend is running.
2. Verify its actual listening URL.
3. Compare the backend URL with the proxy target in `vite.config.js`.
4. Inspect the browser's Network tab for failed requests.
5. Review the backend logs for exceptions or database errors.

### Media uploads fail

**Symptom:** Uploading an image or other supported media fails.

**Resolution:**

1. Check the backend logs.
2. Confirm that the required Cloudinary settings are configured.
3. Verify the credentials using the Cloudinary dashboard.
4. Check the application's media validation and upload restrictions.
5. Confirm that the configured development environment can reach the required external service.

### Port already in use

**Symptom:** A development server cannot start because its port is occupied.

**Resolution:**

1. Check whether another instance of the application is already running.
2. Stop the existing process if it is no longer needed.
3. If necessary, change the relevant development port and update dependent configuration, including the frontend proxy.

## 11. Stop the Application

To stop a development server, select its terminal in VS Code and press:

```text
Ctrl + C
```

Stop the frontend and backend processes separately.

Stopping the application does not delete the PostgreSQL database or its contents.

## Related Documentation

- [Project Overview](../README.md)
- [API Reference](api-reference.md)
- [System Architecture](architecture.md)
- [Troubleshooting Guide](troubleshooting.md)

