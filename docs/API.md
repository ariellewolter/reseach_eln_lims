# API Documentation

## Overview
This document describes the API endpoints for both the Personal Research Notebook and LIMS applications.

## Base URLs
- **Personal API**: `http://localhost:3001`
- **LIMS API**: `http://localhost:3002`

## Authentication
Currently, the APIs run without authentication for development purposes. In production, implement JWT-based authentication.

## Personal API Endpoints

### Notes
```
GET    /api/notes          - List all notes
GET    /api/notes/:id      - Get note by ID
POST   /api/notes          - Create new note
PUT    /api/notes/:id      - Update note
DELETE /api/notes/:id      - Delete note
```

### Tables
```
GET    /api/tables         - List all tables
GET    /api/tables/:id     - Get table by ID
POST   /api/tables         - Create new table
PUT    /api/tables/:id     - Update table
DELETE /api/tables/:id     - Delete table
```

### Projects
```
GET    /api/projects       - List all projects
GET    /api/projects/:id   - Get project by ID
POST   /api/projects       - Create new project
PUT    /api/projects/:id   - Update project
DELETE /api/projects/:id   - Delete project
```

### Chemicals
```
GET    /api/chemicals      - List all chemicals
GET    /api/chemicals/:id  - Get chemical by ID
POST   /api/chemicals      - Create new chemical
PUT    /api/chemicals/:id  - Update chemical
DELETE /api/chemicals/:id  - Delete chemical
```

### Tasks
```
GET    /api/tasks          - List all tasks
GET    /api/tasks/:id      - Get task by ID
POST   /api/tasks          - Create new task
PUT    /api/tasks/:id      - Update task
DELETE /api/tasks/:id      - Delete task
```

## LIMS API Endpoints

### All Personal API endpoints plus:

### Labs
```
GET    /api/labs           - List all labs
GET    /api/labs/:id       - Get lab by ID
POST   /api/labs           - Create new lab
PUT    /api/labs/:id       - Update lab
DELETE /api/labs/:id       - Delete lab
```

### Users
```
GET    /api/users          - List all users
GET    /api/users/:id      - Get user by ID
POST   /api/users          - Create new user
PUT    /api/users/:id      - Update user
DELETE /api/users/:id      - Delete user
```

## Data Models

### Note
```typescript
{
  id: string;
  title: string;
  markdown: string;
  userId?: string;
  projectId?: string;
  updatedAt?: string;
  createdAt?: string;
}
```

### TableDoc
```typescript
{
  id: string;
  title: string;
  data: string[][];
  userId?: string;
  projectId?: string;
  updatedAt?: string;
  createdAt?: string;
}
```

### Project
```typescript
{
  id: string;
  title: string;
  description?: string;
  ownerId: string;
}
```

### Chemical
```typescript
{
  id: string;
  name: string;
  cas?: string;
  vendor?: string;
  catalog?: string;
  units?: string;
}
```

### Task
```typescript
{
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  assigneeId?: string;
  due?: string;
}
```

### Lab
```typescript
{
  id: string;
  name: string;
}
```

### User
```typescript
{
  id: string;
  name: string;
  email: string;
  role: 'student' | 'pi' | 'tech' | 'admin';
  labId?: string;
}
```

## Error Responses
All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "statusCode": 400
}
```

## Success Responses
Successful operations return the requested data or confirmation:

```json
{
  "data": {...},
  "message": "Operation successful"
}
```

## Rate Limiting
Currently no rate limiting implemented. Consider adding in production.

## CORS
Both APIs are configured to accept requests from their respective frontend applications.
