# 🎬 Movie Management System

[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![PNPM](https://img.shields.io/badge/PNPM-8.6.10-orange.svg)](https://pnpm.io/)
[![Docker](https://img.shields.io/badge/Docker-compose-blue.svg)](https://docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A full-stack movie management application with NestJS backend, Next.js frontend, and Neobrutalism design system.

## ✨ Features

- **JWT Authentication**: Secure user registration and login system
- **Movie Management**: Browse, search, and view detailed information about movies
- **Actor Management**: Explore actors and their filmographies
- **Advanced Search**: Search across movies, actors, and genres
- **Infinite Scroll**: Pagination with TanStack Query infinite scroll
- **Database Integration**: PostgreSQL with TypeORM
- **Responsive Design**: Modern Neobrutalism UI with Tailwind CSS
- **Protected Routes**: Authentication required to access the application

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose

### Setup & Start

```bash
git clone <repository-url>
cd movie-management

# Start development environment
make start

# Seed database with real movie data
make seed
```

## 🛠️ Available Commands

```bash
make start           # Start development environment with hot reload
make stop            # Stop all services
make restart         # Restart all services
make logs            # View all container logs
make status          # Show service status
make seed            # Seed database with sample data
make clean           # Remove containers and images

# Optional tools
make adminer         # Start Adminer DB UI (localhost:8080)
make portainer       # Start Portainer Docker UI (localhost:9000)
make tools           # Start all tools (Adminer + Portainer)
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: postgresql://postgres:password@localhost:5432/movie_management

### Optional Tools

- **Adminer** (DB UI): http://localhost:8080 (`make adminer`)
- **Portainer** (Docker UI): http://localhost:9000 (`make portainer`)

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication. Users must register and login to access the application.

### User Registration & Login

1. **Access the application**: Navigate to http://localhost:3000
2. **Register**: Click "Sign up" to create a new account with email and password
3. **Login**: Use your credentials to sign in

### API Authentication

All API endpoints require JWT authentication via the `Authorization` header:

```bash
# Register a new user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Use the returned JWT token for protected endpoints
curl -H "Authorization: Bearer <your_jwt_token>" http://localhost:3001/movies
```

### Available Auth Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

All other endpoints require authentication with a valid JWT token.

## 🏗️ Architecture

- **Backend**: NestJS + TypeScript + TypeORM + PostgreSQL + JWT Authentication
- **Frontend**: Next.js + TypeScript + TailwindCSS + Neobrutalism UI + Protected Routes
- **Database**: PostgreSQL with movie/actor/user relationships
- **Authentication**: JWT with Passport.js and bcrypt password hashing
- **Container**: Docker with hot reload for development

## 🎨 Technical Features

- **JWT Authentication**: Secure user registration and login with Passport.js
- **Protected API Endpoints**: All CRUD operations require authentication
- **CRUD Operations**: For Movies, Actors, Ratings, and Users
- **Search Functionality**: Across all entities with authentication
- **TMDB API Integration**: Real movie data seeding
- **Responsive Neobrutalism Design**: Modern, bold UI components
- **TypeScript**: End-to-end type safety
- **Docker Containerization**: Easy development setup

## 🔧 Development

```bash
# View specific service logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs database

# Access database directly
docker-compose exec database psql -U postgres -d movie_management

# Run tests
docker-compose exec backend pnpm test
```

---

**Built with NestJS, Next.js, and Neobrutalism Design**
