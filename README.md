# Sports Training Tracker API

A production-ready backend REST API for a **Sports Training Tracker** with JWT authentication, role-based authorization, and comprehensive testing.

## Features

- **JWT-based Authentication**: Secure user registration, login, and session management
- **Role-based Authorization (RBAC)**: Two user roles (admin, athlete) with different permissions
- **RESTful API Design**: Full CRUD operations for Users, Workouts, and Goals
- **Centralized Error Handling**: Consistent error responses with proper HTTP status codes
- **Comprehensive Testing**: Unit tests for authentication, authorization, and CRUD operations
- **Production Ready**: Configured for deployment on platforms like Render

## Technology Stack

- **Runtime**: Node.js with Express.js
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Testing**: Jest & Supertest
- **Logging**: Morgan
- **Rate Limiting**: express-rate-limit

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sports-training-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory (use `.env.example` as a template):

```bash
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Important**: Always change the `JWT_SECRET` in production to a strong, random string.

### 4. Run the Application

#### Development Mode (with auto-reload)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

The API will be running at **http://localhost:3000**

### 5. Run Tests

```bash
npm test
```

---

## API Documentation

### Authentication

All endpoints except `/api/auth/register` and `/api/auth/login` require authentication via JWT token.

**Authentication Header Format:**
```
Authorization: Bearer <your-jwt-token>
```

### Base URL

```
http://localhost:3000/api
```

---

## Endpoints

### Authentication Endpoints

#### Register a New User

**POST** `/api/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "athlete"  // Optional: "athlete" (default) or "admin"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "athlete"
  }
}
```

#### Login

**POST** `/api/auth/login`

Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "athlete"
  }
}
```

#### Get Current User

**GET** `/api/auth/me`

Returns the currently authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "athlete"
  }
}
```

#### Logout

**POST** `/api/auth/logout`

Logs out the current user (token should be deleted client-side).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logout successful. Please delete the token on client side."
}
```

---

### User Endpoints

#### Get All Users

**GET** `/api/users`

**Authorization:** Admin only

Returns a list of all users.

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "athlete",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get User by ID

**GET** `/api/users/:id`

**Authorization:** User can view their own profile, Admin can view any profile

**Response (200):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "athlete",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update User

**PUT** `/api/users/:id`

**Authorization:** User can update their own profile, Admin can update any profile

**Request Body:**
```json
{
  "name": "Jane Doe",
  "password": "newPassword123",
  "role": "admin"  // Only admin can change roles
}
```

**Response (200):**
```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "john@example.com",
  "role": "admin"
}
```

#### Delete User

**DELETE** `/api/users/:id`

**Authorization:** Admin only

**Response (204):** No content

---

### Workout Endpoints

#### Get All Workouts

**GET** `/api/workouts`

**Authorization:** Required
- Athletes see only their own workouts
- Admins see all workouts

**Response (200):**
```json
[
  {
    "id": 1,
    "type": "Running",
    "date": "2024-01-01",
    "durationMinutes": 30,
    "notes": "Morning run",
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Workout by ID

**GET** `/api/workouts/:id`

**Authorization:** Required (owner or admin)

**Response (200):**
```json
{
  "id": 1,
  "type": "Running",
  "date": "2024-01-01",
  "durationMinutes": 30,
  "notes": "Morning run",
  "userId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Create Workout

**POST** `/api/workouts`

**Authorization:** Required (automatically assigned to current user)

**Request Body:**
```json
{
  "type": "Running",
  "date": "2024-01-01",
  "durationMinutes": 30,
  "notes": "Morning run"
}
```

**Response (201):**
```json
{
  "id": 1,
  "type": "Running",
  "date": "2024-01-01",
  "durationMinutes": 30,
  "notes": "Morning run",
  "userId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update Workout

**PUT** `/api/workouts/:id`

**Authorization:** Required (owner or admin)

**Request Body:**
```json
{
  "durationMinutes": 45,
  "notes": "Extended run"
}
```

**Response (200):**
```json
{
  "id": 1,
  "type": "Running",
  "date": "2024-01-01",
  "durationMinutes": 45,
  "notes": "Extended run",
  "userId": 1,
  "updatedAt": "2024-01-01T01:00:00.000Z"
}
```

#### Delete Workout

**DELETE** `/api/workouts/:id`

**Authorization:** Required (owner or admin)

**Response (204):** No content

---

### Goal Endpoints

#### Get All Goals

**GET** `/api/goals`

**Authorization:** Required
- Athletes see only their own goals
- Admins see all goals

**Response (200):**
```json
[
  {
    "id": 1,
    "description": "Run a marathon",
    "status": "in_progress",
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Goal by ID

**GET** `/api/goals/:id`

**Authorization:** Required (owner or admin)

**Response (200):**
```json
{
  "id": 1,
  "description": "Run a marathon",
  "status": "in_progress",
  "userId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Create Goal

**POST** `/api/goals`

**Authorization:** Required (automatically assigned to current user)

**Request Body:**
```json
{
  "description": "Run a marathon",
  "status": "not_started"  // Optional: "not_started" (default), "in_progress", "completed"
}
```

**Response (201):**
```json
{
  "id": 1,
  "description": "Run a marathon",
  "status": "not_started",
  "userId": 1,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update Goal

**PUT** `/api/goals/:id`

**Authorization:** Required (owner or admin)

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response (200):**
```json
{
  "id": 1,
  "description": "Run a marathon",
  "status": "completed",
  "userId": 1,
  "updatedAt": "2024-01-01T02:00:00.000Z"
}
```

#### Delete Goal

**DELETE** `/api/goals/:id`

**Authorization:** Required (owner or admin)

**Response (204):** No content

---

## Role-Based Permissions

### Athlete Role
- Can register and login
- Can view/update their own profile
- Can create/read/update/delete their own workouts
- Can create/read/update/delete their own goals
- Cannot view other users' data
- Cannot access admin-only endpoints

### Admin Role
- All athlete permissions
- Can view all users
- Can update any user (including role changes)
- Can delete any user
- Can view/update/delete all workouts
- Can view/update/delete all goals

---

## Error Handling

The API uses consistent error responses with appropriate HTTP status codes.

### Common Status Codes

- `200 OK` - Successful GET, PUT requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "error": "Error message describing what went wrong"
}
```

---

## Deployment

### Deploying to Render

1. **Create a new Web Service** on [Render](https://render.com)

2. **Connect your GitHub repository**

3. **Configure the service:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

4. **Set Environment Variables:**
   - `JWT_SECRET`: A strong, random secret key for JWT signing
   - `PORT`: (Optional, Render sets this automatically)

5. **Deploy** - Render will automatically deploy your application

### Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT token signing | `your-super-secret-key-123` |
| `PORT` | Server port (set automatically by hosting platform) | `3000` |

---

## Testing

The project includes comprehensive test coverage:

- **Authentication Tests**: Registration, login, logout, token validation
- **Authorization Tests**: Role-based access control for all endpoints
- **CRUD Tests**: Create, read, update, delete operations for all resources
- **Error Handling Tests**: Proper error responses and status codes

Run tests with:
```bash
npm test
```

---

## Project Structure

```
sports-training-tracker/
├── __tests__/              # Test files
│   ├── auth.test.js        # Authentication tests
│   ├── users.test.js       # User endpoint tests
│   ├── workouts.test.js    # Workout endpoint tests
│   ├── goals.test.js       # Goal endpoint tests
│   └── testSetup.js        # Test utilities
├── db/                     # Database configuration
│   └── sequelize.js        # Sequelize setup
├── middleware/             # Custom middleware
│   ├── auth.js             # Authentication & authorization
│   └── errorHandler.js     # Error handling
├── models/                 # Database models
│   ├── User.js             # User model
│   ├── Workout.js          # Workout model
│   ├── Goal.js             # Goal model
│   └── index.js            # Model associations
├── routes/                 # API routes
│   ├── auth.js             # Authentication routes
│   ├── users.js            # User routes
│   ├── workouts.js         # Workout routes
│   └── goals.js            # Goal routes
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies
├── README.md               # This file
└── server.js               # Application entry point
```

---

## Security Considerations

- **Passwords**: All passwords are hashed using bcryptjs before storage
- **JWT Tokens**: Tokens expire after 24 hours
- **Environment Variables**: Sensitive data stored in environment variables
- **Input Validation**: Sequelize validates all model data
- **Role-Based Access**: Endpoints protected with appropriate authorization checks
- **Rate Limiting**: API is protected with rate limiting (100 requests per 15 minutes per IP)

---

## License

ISC

## Author

GiAndre Lee

---

## Support

For issues, questions, or contributions, please open an issue in the repository.
