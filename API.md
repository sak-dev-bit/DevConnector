# DevConnector API Documentation

This document outlines the RESTful API endpoints available in the DevConnector application. The API follows REST conventions, using proper HTTP verbs, status codes, and JSON response formats.

- **Base URL**: `/api`
- **Response Format**: Most responses include a `success` boolean and a `msg` string.

---

## Authentication `/api/auth`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login user and get token | Public |
| GET | `/logout` | Logout user | Private |
| POST | `/refresh` | Refresh access token using cookie | Public/Private |

---

## Profiles `/api/profile`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/me` | Get current user's profile | Private |
| POST | `/` | Create or update user profile | Private |
| GET | `/` | Get all profiles | Public |
| GET | `/user/:user_id` | Get profile by user ID | Public |
| DELETE | `/` | Delete profile, user & posts | Private |
| POST | `/:user_id/follow` | Follow a user | Private |
| DELETE | `/:user_id/follow` | Unfollow a user | Private |
| GET | `/:user_id/followers` | Get user's followers | Public |
| GET | `/:user_id/following` | Get users being followed | Public |
| POST | `/avatar` | Upload or update avatar | Private |

---

## Posts `/api/posts`

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create a post | Private |
| GET | `/` | Get all posts (with pagination) | Public |
| GET | `/:id` | Get post by ID | Public |
| PUT | `/:id` | Update a post | Private |
| DELETE | `/:id` | Delete a post | Private |
| POST | `/:id/like` | Like/Unlike a post (Toggle) | Private |
| POST | `/:id/comment` | Add a comment to a post | Private |
| DELETE | `/:id/comment/:comment_id` | Delete a comment | Private |
| GET | `/user/:user_id` | Get posts by user ID | Public |

---

## Error Handling

The API uses standardized HTTP status codes:

- `200 OK`: Successful request.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Invalid request parameters or validation failed.
- `401 Unauthorized`: Authentication failed or token is missing/expired.
- `404 Not Found`: Requested resource does not exist.
- `500 Internal Server Error`: An error occurred on the server.

Example Error Response:
```json
{
  "success": false,
  "msg": "Invalid credentials"
}
```
