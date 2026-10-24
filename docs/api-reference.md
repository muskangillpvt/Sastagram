# Sastagram API Reference

## 1. Overview

Sastagram is a social media application with an ASP.NET Core backend, a React frontend, and a PostgreSQL database.

This document describes the backend API, including its purpose, available endpoint groups, authentication approach, request formats, and response handling.

> **Documentation status:** Initial draft. Endpoint paths, request schemas, response formats, and authentication requirements must be verified against the implementation before this reference is considered complete.

### Technology stack

- **Backend:** ASP.NET Core Web API
- **Frontend:** React with Vite
- **Database:** PostgreSQL
- **Authentication:** JWT-based authentication is implemented through the application's authentication and token services.
- **API controllers:** Authentication, posts, users, and comments/stories/notifications.

## 2. Base URL

The API base URL depends on the backend's local launch configuration.

| Environment | Base URL |
|---|---|
| Local development | Confirm in `backend/Sastagram/Properties/launchSettings.json` |
| Production | Configure according to the deployed backend URL |

For local development, start the backend and use the URL printed in the terminal or configured in `launchSettings.json`.

The frontend's Vite proxy is configured separately. Check `frontend/Sastagram/vite.config.js` to confirm how frontend requests are forwarded to the backend.

## 3. Request conventions

### HTTP methods

The API may use the following HTTP methods, depending on the controller action:

| Method | Typical purpose |
|---|---|
| `GET` | Retrieve data |
| `POST` | Create a resource or submit an action |
| `PUT` | Replace or update a resource |
| `PATCH` | Partially update a resource |
| `DELETE` | Delete a resource |

These are general HTTP conventions. Confirm the actual methods supported by each Sastagram endpoint in its controller.

### Request headers

JSON requests commonly use the following header:

```http
Content-Type: application/json
```

For endpoints that require JWT authentication, send the access token in the authorization header:

```http
Authorization: Bearer <access_token>
```

Use the authentication requirements defined by the individual endpoint. Do not assume that every endpoint requires authentication.

### Request bodies

Endpoints that accept data may require a JSON request body. The required fields, field types, validation rules, and optional values must match the relevant request DTO or controller implementation.

For example, the following is an illustrative JSON structure, **not a verified Sastagram request schema**:

```json
{
  "exampleField": "example value"
}
```

Consult `backend/Sastagram/DTOs/Dtos.cs` and the relevant controller to identify the actual fields.

## 4. Authentication

Sastagram uses JWT-related authentication functionality. The authentication controller and token service are located in:

- `backend/Sastagram/Controllers/AuthController.cs`
- `backend/Sastagram/Services/TokenService.cs`

### Authentication workflow

The exact workflow must be confirmed from the implementation.

1. Send a request to the relevant authentication endpoint.
2. Provide the required credentials or registration details.
3. Read the response returned by the backend.
4. If an access token is returned, use it in the `Authorization` header for endpoints that require authentication.
5. Handle authentication errors without exposing credentials or tokens.

### Token security

- Do not commit access tokens, passwords, JWT signing keys, or other secrets to source control.
- Do not share a token in screenshots, issue reports, or public documentation.
- Store secret configuration outside committed files.
- Confirm token expiry and authorization behaviour from the implementation rather than assuming default values.

## 5. Endpoint reference

The following sections group the API by controller. Each endpoint should be documented with its exact HTTP method, route, parameters, request schema, response schema, and access requirements.

### 5.1 Authentication

**Controller:** `AuthController.cs`

**Purpose:** Handles authentication-related operations.

| Property | Details |
|---|---|
| Controller file | `backend/Sastagram/Controllers/AuthController.cs` |
| Endpoint paths | To be extracted from route attributes |
| Supported methods | To be verified |
| Authentication requirements | To be verified for each action |
| Request and response schemas | To be verified |

For each action, document:

- HTTP method and complete route
- Whether the action registers a user, logs in a user, or performs another authentication operation
- Required request fields and validation rules
- Successful response body and status code
- Error responses
- Whether a JWT is returned

### 5.2 Posts

**Controller:** `PostsController.cs`

**Purpose:** Handles post-related operations.

| Property | Details |
|---|---|
| Controller file | `backend/Sastagram/Controllers/PostsController.cs` |
| Endpoint paths | To be extracted from route attributes |
| Supported methods | To be verified |
| Authentication requirements | To be verified for each action |
| Request and response schemas | To be verified |

For each action, document:

- Whether it retrieves, creates, updates, or deletes posts
- Required route parameters and query parameters
- Request body fields
- Response structure
- Validation and error handling
- Any ownership or authorization checks

### 5.3 Users

**Controller:** `UsersController.cs`

**Purpose:** Handles user-related operations.

| Property | Details |
|---|---|
| Controller file | `backend/Sastagram/Controllers/UsersController.cs` |
| Endpoint paths | To be extracted from route attributes |
| Supported methods | To be verified |
| Authentication requirements | To be verified for each action |
| Request and response schemas | To be verified |

For each action, document:

- The user information or operation involved
- Required route and query parameters
- Accepted request fields
- Returned user data
- Authentication and authorization requirements
- Error responses

Do not document sensitive user fields as publicly returned unless the implementation confirms that they are included in the response.

### 5.4 Comments, stories, and notifications

**Controller:** `CommentsStoriesNotificationsController.cs`

**Purpose:** Groups operations related to comments, stories, and notifications.

| Property | Details |
|---|---|
| Controller file | `backend/Sastagram/Controllers/CommentsStoriesNotificationsController.cs` |
| Endpoint paths | To be extracted from route attributes |
| Supported methods | To be verified |
| Authentication requirements | To be verified for each action |
| Request and response schemas | To be verified |

Document each action separately. Include the resource involved, required identifiers, request fields, response format, and access requirements.

Do not assume that every operation in this controller uses the same route or authorization policy.

## 6. Endpoint documentation template

Use this template for every verified endpoint.

### `METHOD /exact/route`

**Description:** Explain what the endpoint does.

**Authentication:** Required, not required, or conditional — based on the implementation.

**Parameters:**

| Name | Location | Type | Required | Description |
|---|---|---|---|---|
| To be verified | Path, query, or body | To be verified | To be verified | To be verified |

**Request body:**

Include a JSON example only if the endpoint accepts a request body. The example must match the actual DTO or action parameters.

```json
{
  "field": "replace with a verified example"
}
```

**Success response:**

Document the actual HTTP status code and response body.

**Error responses:**

List only the status codes and error formats that the endpoint can actually return.

**Implementation reference:**

Link or refer to the relevant controller action and DTO.

## 7. HTTP status codes and errors

The following status codes are common in HTTP APIs. Their presence in this table does not guarantee that every Sastagram endpoint returns them.

| Status code | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | A resource was created |
| `204 No Content` | Request succeeded without a response body |
| `400 Bad Request` | Request data is invalid or cannot be processed |
| `401 Unauthorized` | Authentication is missing or invalid |
| `403 Forbidden` | The caller is not permitted to perform the operation |
| `404 Not Found` | The requested resource or endpoint was not found |
| `500 Internal Server Error` | An unexpected server error occurred |

Verify the status codes and response body for each action. Record whether errors are returned as plain text, JSON, validation details, or another format.

## 8. Example API request

The following is a generic example of sending a JSON request using `curl`. Replace the placeholder URL, method, path, and body with the values documented for a real Sastagram endpoint.

```bash
curl -X GET "http://localhost:<port>/<verified-route>" \
  -H "Accept: application/json"
```

For an authenticated endpoint, include the bearer token:

```bash
curl -X GET "http://localhost:<port>/<verified-route>" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer <access_token>"
```

Do not run these examples unchanged. The route and port placeholders must be replaced with verified values.

## 9. Testing the API

Recommended testing workflow:

1. Start the ASP.NET Core backend.
2. Confirm the backend URL from its startup output.
3. Inspect the available routes and request schemas in the controller files.
4. Use Swagger/OpenAPI if it is configured and enabled in the application.
5. Otherwise, send requests through Postman or `curl`.
6. Test successful requests and relevant failure cases.
7. Record the observed response codes and response bodies.
8. Update this document whenever an endpoint or its behaviour changes.

## 10. Source files

Use these files as the primary source of truth when maintaining this reference.

| File | Documentation purpose |
|---|---|
| `backend/Sastagram/Program.cs` | Application setup and middleware configuration |
| `backend/Sastagram/Controllers/AuthController.cs` | Authentication routes and behaviour |
| `backend/Sastagram/Controllers/PostsController.cs` | Post-related routes and behaviour |
| `backend/Sastagram/Controllers/UsersController.cs` | User-related routes and behaviour |
| `backend/Sastagram/Controllers/CommentsStoriesNotificationsController.cs` | Comment, story, and notification routes |
| `backend/Sastagram/DTOs/Dtos.cs` | Request and response data-transfer objects |
| `backend/Sastagram/Models/` | Domain model definitions |
| `backend/Sastagram/Services/TokenService.cs` | Token-generation behaviour |
| `frontend/Sastagram/vite.config.js` | Frontend development proxy configuration |

## 11. Maintenance

Keep this reference aligned with the implementation.

When changing an endpoint:

- Update its method, route, and description.
- Update request and response examples.
- Document authentication and authorization requirements.
- Verify status codes and error formats.
- Test the updated endpoint.
- Remove outdated examples and placeholder text.
