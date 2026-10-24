# Sastagram — Troubleshooting Guide

## 1. Overview

This guide helps developers diagnose and resolve common issues when installing, running, and testing Sastagram locally.

Sastagram consists of a React frontend, an ASP.NET Core backend, and a PostgreSQL database. Problems may occur when configuring dependencies, connecting to the database, starting the development servers, or sending API requests.

This guide covers common symptoms, possible causes, and recommended troubleshooting steps.

## 2. Before troubleshooting

Before making changes, check the following:

- [ ] The repository has been cloned successfully.
- [ ] The required .NET SDK and Node.js versions are installed.
- [ ] PostgreSQL is installed and running.
- [ ] The backend configuration contains the required settings.
- [ ] The frontend and backend are started in their respective directories.
- [ ] The terminal output has been checked for errors.

When troubleshooting, change one thing at a time and retest the application. Avoid deleting files or changing configuration without understanding the effect.

## 3. Backend issues

### 3.1 The backend does not start

**Symptoms**

- The application exits immediately.
- The terminal displays a build or startup error.
- The backend does not display a listening URL.

**Possible causes**

- The required .NET SDK is missing.
- The installed SDK is incompatible with the project target framework.
- NuGet dependencies have not been restored.
- Configuration is missing or invalid.
- The configured port is already in use.

**Resolution**

1. Open a terminal in `backend/Sastagram/`.
2. Check the installed SDKs:

   ```bash
   dotnet --list-sdks
   ```

3. Open `Sastagram.csproj` and check the target framework.
4. Restore the dependencies:

   ```bash
   dotnet restore
   ```

5. Build the project:

   ```bash
   dotnet build
   ```

6. Read the first relevant error in the terminal and resolve it before continuing.
7. Start the backend:

   ```bash
   dotnet run
   ```

If the error persists, compare the project configuration with the installed SDK and inspect the startup logs.

### 3.2 .NET SDK or target framework mismatch

**Symptoms**

- The build reports that a target framework is unsupported.
- The project cannot locate a compatible SDK.
- Compilation fails before the application starts.

**Possible causes**

The project targets a .NET version that is not supported by the installed SDK or development environment.

**Resolution**

1. Open `backend/Sastagram/Sastagram.csproj`.
2. Locate the `TargetFramework` setting.
3. Run:

   ```bash
   dotnet --info
   ```

4. Compare the target framework with the installed SDKs and the project's requirements.
5. Install a compatible SDK or update the project framework only after checking package compatibility and project requirements.

Do not change the target framework solely to remove an error without checking compatibility.

### 3.3 The backend port is already in use

**Symptoms**

- The application reports that it cannot bind to an address.
- Startup fails with an address-in-use error.

**Possible causes**

Another application is already using the configured port, or the backend is running in another terminal.

**Resolution**

1. Check the URL and port in `Properties/launchSettings.json`.
2. Check whether another instance of Sastagram is running.
3. Stop the conflicting process if it is no longer needed, or configure a different available port.
4. Restart the backend.
5. If the frontend uses a Vite proxy, update its target if the backend URL changes.

The actual port depends on the project's launch configuration.

## 4. Database issues

### 4.1 The backend cannot connect to PostgreSQL

**Symptoms**

- The application reports a database connection failure.
- Requests that require database access fail.
- The backend logs contain connection or authentication errors.

**Possible causes**

- PostgreSQL is not running.
- The connection string is incorrect.
- The database does not exist.
- The username or password is incorrect.
- The configured host or port is unreachable.

**Resolution**

1. Confirm that the PostgreSQL service is running.
2. Check the connection string used by the backend.
3. Verify the database name, host, port, username, and password.
4. Confirm that the database exists.
5. Test the connection using a PostgreSQL client.
6. Restart the backend and review the logs.

A connection string commonly contains a host, port, database name, username, and password. Use the exact configuration expected by the application.

**Security note:** Do not paste real database credentials into public issue reports or commit them to GitHub.

### 4.2 The database does not exist

**Symptoms**

- PostgreSQL reports that the requested database cannot be found.
- The backend fails when opening a database connection.

**Possible causes**

The database has not been created, or the connection string references the wrong database name.

**Resolution**

1. Check the database name in the backend configuration.
2. Connect to PostgreSQL using an administrative or appropriately privileged account.
3. Create the database if it does not exist and you have permission to do so.
4. Ensure the connection string references the correct database.
5. Continue with the database migration steps.

If using a local database named `sastagram`, verify that this matches the actual connection string and setup instructions.

### 4.3 Entity Framework Core migrations fail

**Symptoms**

- `dotnet ef database update` fails.
- The application reports a missing table or column.
- The database schema does not match the current code.

**Possible causes**

- The database connection is invalid.
- The Entity Framework Core tooling is missing.
- The migrations have not been applied.
- The migrations or model configuration are inconsistent.
- The installed tooling or package versions are incompatible.

**Resolution**

1. Confirm the backend project and database connection settings.
2. Check whether the Entity Framework Core CLI tool is installed:

   ```bash
   dotnet ef --version
   ```

3. If the tool is missing, install it using the official Entity Framework Core tooling instructions.
4. From the backend project directory, inspect the available migrations:

   ```bash
   dotnet ef migrations list
   ```

5. If the project uses migrations to create or update the schema, apply them:

   ```bash
   dotnet ef database update
   ```

6. Review the complete error output if the command fails.

Do not delete migrations or reset a database as a first troubleshooting step. Database resets can destroy data.

## 5. Frontend issues

### 5.1 The frontend does not start

**Symptoms**

- `npm run dev` fails.
- The terminal reports missing packages or scripts.
- The frontend development URL is not displayed.

**Possible causes**

- Node.js or npm is missing.
- Dependencies have not been installed.
- The terminal is in the wrong directory.
- The `dev` script is missing from `package.json`.

**Resolution**

1. Open a terminal in `frontend/Sastagram/`.
2. Check the installed versions:

   ```bash
   node --version
   npm --version
   ```

3. Confirm that `package.json` exists and contains the expected scripts.
4. Install the dependencies:

   ```bash
   npm install
   ```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the local URL printed by Vite.

If installation fails, read the package manager's error output before changing dependency versions.

### 5.2 The browser displays a blank page

**Symptoms**

- The frontend URL opens but the page is blank.
- Components do not render.
- The browser console displays JavaScript errors.

**Possible causes**

- A runtime error occurred in a React component.
- An import path is incorrect.
- A frontend dependency is missing or incompatible.
- A required API request failed and the UI does not handle the failure correctly.

**Resolution**

1. Open the browser's developer tools.
2. Inspect the **Console** tab for JavaScript errors.
3. Inspect the **Network** tab for failed requests.
4. Check the terminal running Vite for compilation errors.
5. Fix the first relevant error and reload the page.

Avoid assuming that a blank page is caused by the backend until the browser console and network requests have been checked.

### 5.3 The frontend cannot reach the backend

**Symptoms**

- API requests fail.
- Data does not load.
- The browser reports connection errors or failed network requests.

**Possible causes**

- The backend is not running.
- The frontend is sending requests to the wrong URL.
- The Vite proxy target is incorrect.
- The backend port has changed.
- A cross-origin request is blocked by the browser.

**Resolution**

1. Confirm that the backend is running.
2. Check the backend URL printed in its terminal.
3. Inspect `frontend/Sastagram/vite.config.js`.
4. Verify the proxy target and frontend request paths.
5. If the backend URL or port changed, update the relevant configuration.
6. Inspect the failed request in the browser's Network tab.
7. Check the backend logs for the corresponding request.

Do not disable browser security features as a workaround.

## 6. API and authentication issues

### 6.1 An API request returns `401 Unauthorized`

**Symptoms**

The backend rejects a request with an HTTP `401` status.

**Possible causes**

- The endpoint requires authentication.
- The access token is missing.
- The token is invalid or expired.
- The authorization header is malformed.

**Resolution**

1. Check the endpoint's authentication requirements in `api-reference.md`.
2. Confirm that the relevant authentication flow completed successfully.
3. If the endpoint requires a bearer token, check the request header:

   ```http
   Authorization: Bearer <access_token>
   ```

4. Confirm that the token is being sent in the expected format.
5. Obtain a valid token through the application's supported authentication flow if necessary.
6. Review backend logs for additional diagnostic information.

Do not publish real access tokens in screenshots, logs, or documentation.

### 6.2 An API request returns `403 Forbidden`

**Symptoms**

The server denies an operation with an HTTP `403` status.

**Possible causes**

The request may be authenticated, but the application may not permit the requested operation. The exact cause depends on the endpoint and its authorization logic.

**Resolution**

1. Check whether the endpoint has authorization policies or role requirements.
2. Confirm that the authenticated user is allowed to perform the requested operation.
3. Inspect any resource-ownership checks implemented by the backend.
4. Review the server logs and relevant controller code.

Do not assume that obtaining a valid JWT automatically grants access to every operation.

### 6.3 An API request returns `400 Bad Request`

**Symptoms**

The backend rejects a request with an HTTP `400` status.

**Possible causes**

- A required field is missing.
- A field has an invalid value or type.
- The JSON body is malformed.
- A validation rule has not been satisfied.

**Resolution**

1. Check the endpoint's request schema in `api-reference.md`.
2. Compare the submitted JSON with the relevant DTO or action parameters.
3. Check field names, types, and required values.
4. Inspect the response body for validation details.
5. Retry the request with corrected data.

Use the actual DTO definitions and validation rules as the source of truth.

### 6.4 An API request returns `404 Not Found`

**Symptoms**

The server returns an HTTP `404` status.

**Possible causes**

- The requested route is incorrect.
- The HTTP method does not match the endpoint.
- The requested resource does not exist.
- The frontend is constructing the wrong URL.

**Resolution**

1. Verify the route and HTTP method in the relevant controller.
2. Check the URL sent by the frontend.
3. Confirm that any required route parameters are correct.
4. If the endpoint targets a resource by identifier, verify that the resource exists.

A `404` response does not always mean that the route itself is incorrect; the resource may be missing.

## 7. Git and repository issues

### 7.1 Git reports uncommitted changes

**Symptoms**

`git status` shows modified, untracked, or staged files.

**Resolution**

Run:

```bash
git status
```

Review the changes before committing.

To stage only the documentation files:

```bash
git add docs/
```

Then commit:

```bash
git commit -m "docs: add troubleshooting guide"
```

Push the commit:

```bash
git push
```

Review staged changes before pushing, especially configuration files that may contain secrets.

### 7.2 A sensitive configuration file was committed

**Symptoms**

A password, API key, signing key, or other secret was pushed to a remote repository.

**Resolution**

1. Treat the exposed value as compromised.
2. Rotate or revoke the exposed credential using the relevant service.
3. Move the replacement secret into an appropriate secure configuration mechanism.
4. Remove the secret from tracked configuration files and prevent future accidental commits.
5. Review repository history and access as appropriate.

Deleting the value in a later commit does not remove it from earlier Git history. If a real secret was published, rotating it is the immediate priority.

## 8. Diagnostic information to collect

When a problem persists, collect the following information before requesting help:

- The operation being attempted.
- The exact error message.
- The command that produced the error.
- Whether the issue occurs in the frontend, backend, database, or API.
- Relevant terminal output.
- Relevant browser console or Network tab errors.
- The operating system and installed runtime versions.
- Steps to reproduce the issue.

Remove passwords, access tokens, connection-string credentials, and other sensitive information before sharing logs.

## 9. When the issue remains unresolved

If the troubleshooting steps do not resolve the problem:

1. Reproduce the issue using the same steps.
2. Identify the first relevant error rather than relying only on the final error message.
3. Check the relevant source file and configuration.
4. Compare the observed behaviour with the expected behaviour in the documentation.
5. Record the results of the troubleshooting steps.
6. Create a clear issue report containing the reproduction steps and sanitised logs.

Do not make multiple unrelated configuration changes at once, as this makes the root cause harder to identify.

## 10. Related documentation

- [`README.md`](../README.md) — Project overview.
- [`installation.md`](installation.md) — Installation and local development setup.
- [`api-reference.md`](api-reference.md) — API endpoints and request/response details.
- [`architecture.md`](architecture.md) — System components and data flow.

## 11. Maintenance checklist

Update this guide when:

- [ ] The installation process changes.
- [ ] The supported .NET or Node.js version changes.
- [ ] Database configuration or migration procedures change.
- [ ] Frontend proxy or backend URL configuration changes.
- [ ] API authentication or error handling changes.
- [ ] A recurring issue is identified and a verified solution is available.

Troubleshooting instructions should be tested against the current version of the application before publication.
