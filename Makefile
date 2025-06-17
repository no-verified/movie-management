# Movie Management Dev Commands

.PHONY: help start build clean logs stop restart seed adminer portainer tools

# Default target
help:
	@echo "🎬 Movie Management Dev Commands"
	@echo "=================================="
	@echo ""
	@echo "Main Commands:"
	@echo "  make start     - Start development environment with hot reload"
	@echo "  make logs      - View development logs"
	@echo "  make stop      - Stop development environment"
	@echo "  make restart   - Restart development environment"
	@echo ""
	@echo "Database Commands:"
	@echo "  make seed      - Seed database with sample data"
	@echo "  make db-reset  - Reset database (WARNING: deletes all data)"
	@echo ""
	@echo "Tools:"
	@echo "  make adminer   - Start Adminer UI (http://localhost:8080)"
	@echo "  make portainer - Start Portainer UI (http://localhost:9000)"
	@echo "  make tools     - Start all tools (Adminer + Portainer)"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make build     - Build all Docker images"
	@echo "  make clean     - Remove all containers, images, and volumes"
	@echo "  make status    - Show status of all services"
	@echo ""

# Main commands
start:
	@echo "🚀 Starting development environment..."
	docker-compose up --build -d
	@echo "✅ Development environment started!"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "🔌 Backend API: http://localhost:3001"

stop:
	docker-compose down

restart: stop
	@sleep 2
	docker-compose up -d

# Build images
build:
	@echo "🔨 Building Docker images..."
	docker-compose build

# Database operations
seed:
	@echo "🌱 Seeding database with sample data..."
	@sleep 2
	curl -X POST http://localhost:3001/seeding/movies \
		-H "x-api-key: your_super_secret_api_key_here" \
		|| echo "❌ Seeding failed. Make sure the backend is running."

db-reset:
	@echo "⚠️  Resetting database (this will delete all data)..."
	@read -p "Are you sure? [y/N]: " confirm && [ "$$confirm" = "y" ]
	docker-compose down -v
	docker-compose up -d database
	@echo "🔄 Database reset complete"

# Utility commands
logs:
	docker-compose logs -f

status:
	@echo "📊 Service Status:"
	@echo "=================="
	docker-compose ps

clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -f
	@echo "✨ Cleanup complete"

# Tools management
adminer:
	docker-compose --profile tools up -d adminer
	@echo "🌐 Adminer UI: http://localhost:8080"

portainer:
	docker-compose --profile tools up -d portainer
	@echo "🌐 Portainer UI: http://localhost:9000"

tools:
	docker-compose --profile tools up -d
	@echo "🌐 Adminer UI: http://localhost:8080"
	@echo "🌐 Portainer UI: http://localhost:9000"