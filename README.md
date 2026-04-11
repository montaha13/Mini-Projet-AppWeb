# User Service - SmartRoomBooker Platform

A NestJS microservice for managing user authentication and user data in the SmartRoomBooker platform.

## Features

- User registration and login with JWT authentication
- Role-based access control (ADMIN/USER roles)
- User profile management
- Soft delete functionality
- Eureka service discovery integration
- SQLite database with TypeORM
- Swagger API documentation
- Input validation with class-validator

## Tech Stack

- **Framework**: NestJS with TypeScript
- **Database**: SQLite with TypeORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **Service Discovery**: Eureka (eureka-js-client)

## Installation

```bash
# Install dependencies
npm install

# Create data directory
mkdir -p data
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Application
PORT=3001

# Database
DB_PATH=./data/user-service.db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Eureka
EUREKA_HOST=localhost
EUREKA_PORT=8761
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## API Documentation

Once the application is running, visit `http://localhost:3001/api` to view the Swagger documentation.

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user and return JWT token

### Users (Protected)

- `GET /users` - Get all users (ADMIN only)
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Soft delete user (ADMIN only)
- `GET /users/:id/role` - Get user role (used by other microservices)

## Database Schema

### User Entity

- `id`: UUID (primary key, auto-generated)
- `firstName`: string (not null)
- `lastName`: string (not null)
- `email`: string (unique, not null)
- `password`: string (hashed with bcrypt, not null)
- `role`: enum ['ADMIN', 'USER'] (default: 'USER')
- `isActive`: boolean (default: true)
- `createdAt`: timestamp (auto)
- `updatedAt`: timestamp (auto)

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Role-based access control with @Roles() decorator
- Input validation on all endpoints
- Global validation pipe enabled

## Eureka Integration

The service automatically registers with Eureka on startup:

- **Service Name**: USER-SERVICE
- **Port**: 3001
- **Eureka Host**: localhost (configurable via EUREKA_HOST)
- **Eureka Port**: 8761 (configurable via EUREKA_PORT)

## Error Handling

- `409 Conflict`: Email already exists
- `401 Unauthorized`: Invalid credentials
- `404 Not Found`: User not found
- `403 Forbidden`: Insufficient permissions

## Development

```bash
# Lint code
npm run lint

# Run tests
npm run test

# Run tests with coverage
npm run test:cov
```

## License

This project is licensed under the UNLICENSED license.
