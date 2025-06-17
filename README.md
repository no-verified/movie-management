# 🎬 Movie Management System

A full-stack movie management application with NestJS backend, Next.js frontend, and Neobrutalism design system.

## ✨ Features

- **Movie Management**: Browse, search, and view detailed information about movies
- **Actor Management**: Explore actors and their filmographies
- **Advanced Search**: Search across movies, actors, and genres
- **Infinite Scroll**: Pagination with TanStack Query infinite scroll
- **Database Integration**: PostgreSQL with TypeORM
- **Responsive Design**: Modern Neobrutalism UI with Tailwind CSS

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

## 📚 API Authentication

All API endpoints require the `X-API-Key` header:

```bash
curl -H "X-API-Key: your_super_secret_api_key_here" http://localhost:3001/movies
```

(the secret key is literally `super_secret_api_key`)

## 🏗️ Architecture

- **Backend**: NestJS + TypeScript + TypeORM + PostgreSQL
- **Frontend**: Next.js + TypeScript + TailwindCSS + Neobrutalism UI
- **Database**: PostgreSQL with movie/actor relationships
- **Container**: Docker with hot reload for development

## 🎨 Features

- CRUD operations for Movies, Actors, and Ratings
- Search functionality across all entities
- TMDB API integration for real movie data
- Responsive Neobrutalism design system
- TypeScript throughout the stack
- Docker containerization

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
