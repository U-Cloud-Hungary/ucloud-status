# ===========================================
# Makefile for Docker operations
# ===========================================

IMAGE_NAME = turizoltan96/ucaloudstatus
VERSION = 1.0.0

# Network and database configuration
NETWORK_NAME = ucloud-network
MARIADB_NAME = ucloud-mariadb
APP_NAME = ucaloudstatus-local


# Database credentials
DB_ROOT_PASSWORD = root_password
DB_NAME = ucloud_status
DB_USER = ucloud
DB_PASSWORD = your_secure_password

.PHONY: compose build run clean help push deploy cloudron-install cloudron-uninstall tag network-setup mariadb-start mariadb-stop run-with-db run-full logs status health start stop restart build-run build-run-full db-shell db-admin mariadb-logs version list-tags clean-all

# Default target
help:
	@echo "Available commands:"
	@echo "  make compose           - Start services with docker-compose"
	@echo "  make build             - Build the Docker image"
	@echo "  make run               - Run the container locally on port 3000"
	@echo "  make run-full          - Run MariaDB + App together on shared network"
	@echo "  make run-with-db       - Run with MariaDB on shared network"
	@echo "  make network-setup     - Create Docker network"
	@echo "  make mariadb-start     - Start MariaDB container"
	@echo "  make mariadb-stop      - Stop MariaDB container"
	@echo "  make mariadb-logs      - Show MariaDB logs"
	@echo "  make db-shell          - Access database shell"
	@echo "  make tag               - Create version and latest tags"
	@echo "  make push              - Push image to Docker Hub"
	@echo "  make deploy            - Build, tag and push to Docker Hub"
	@echo "  make cloudron-install  - Install app on Cloudron"
	@echo "  make cloudron-uninstall- Uninstall app from Cloudron"
	@echo "  make clean             - Stop and remove containers"
	@echo "  make clean-all         - Clean containers, network and volumes"
	@echo "  make status            - Show containers and network status"
	@echo "  make help              - Show this help message"
	@echo ""
	@echo "Version: $(VERSION)"
	@echo "Image: $(IMAGE_NAME)"
	@echo "Network: $(NETWORK_NAME)"

# Start docker-compose services
compose:
	docker compose -f docker-compose.local.yml up -d

# Build the Docker image
build:
	@echo "Building $(IMAGE_NAME):$(VERSION)..."
	docker build -t $(IMAGE_NAME):$(VERSION) -f Dockerfile .
	@echo "Build completed!"

# Create Docker network
network-setup:
	@echo "🌐 Creating Docker network $(NETWORK_NAME)..."
	@docker network create $(NETWORK_NAME) 2>/dev/null || echo "Network $(NETWORK_NAME) already exists"

# Start MariaDB container
mariadb-start: network-setup
	@echo "🗄️ Starting MariaDB container..."
	@docker run -d \
		--name $(MARIADB_NAME) \
		--network $(NETWORK_NAME) \
		--restart unless-stopped \
		-e MYSQL_ROOT_PASSWORD=$(DB_ROOT_PASSWORD) \
		-e MYSQL_DATABASE=$(DB_NAME) \
		-e MYSQL_USER=$(DB_USER) \
		-e MYSQL_PASSWORD=$(DB_PASSWORD) \
		-p 3306:3306 \
		-v ucloud_mariadb_data:/var/lib/mysql \
		mariadb:10.11 2>/dev/null || echo "MariaDB container already running"

	@echo "⏳ Waiting for MariaDB to be ready..."
	@sleep 15

	@echo "🔍 Checking MariaDB health..."
	@docker exec $(MARIADB_NAME) mariadb-admin ping -h localhost -u root -p$(DB_ROOT_PASSWORD) 2>/dev/null && echo "✅ MariaDB is ready!" || echo "⚠️ MariaDB may still be starting..."

# Stop MariaDB container
mariadb-stop:
	@echo "🛑 Stopping MariaDB container..."
	@docker stop $(MARIADB_NAME) 2>/dev/null || echo "MariaDB container not running"

# Show MariaDB logs
mariadb-logs:
	@docker logs -f $(MARIADB_NAME)

# Access database shell
db-shell:
	@echo "🐚 Accessing database shell..."
	@docker exec -it $(MARIADB_NAME) mysql -u $(DB_USER) -p$(DB_PASSWORD) $(DB_NAME)

# Access database as admin
db-admin:
	@echo "🐚 Accessing database as admin..."
	@docker exec -it $(MARIADB_NAME) mysql -u root -p$(DB_ROOT_PASSWORD)

# Create tags
tag: build
	@echo "Creating tags..."
	docker tag $(IMAGE_NAME):$(VERSION) $(IMAGE_NAME):latest
	docker tag $(IMAGE_NAME):$(VERSION) $(IMAGE_NAME):v$(VERSION)
	@echo "Tags created:"
	@echo "  - $(IMAGE_NAME):$(VERSION)"
	@echo "  - $(IMAGE_NAME):latest"
	@echo "  - $(IMAGE_NAME):v$(VERSION)"

# Run the container locally (standalone)
run:
	@echo "Starting container on port 3000..."
	docker run -p 3000:3000 --name $(APP_NAME) $(IMAGE_NAME):$(VERSION)

# Run complete stack (MariaDB + App) - ONE COMMAND SOLUTION
run-full:
	@echo "🚀 Starting complete UCloud Status stack..."
	@echo "1️⃣ Creating network..."
	docker network create $(NETWORK_NAME) || echo "Network $(NETWORK_NAME) already exists"
	@echo "2️⃣ Starting MariaDB..."
	docker run -d \
		--name $(MARIADB_NAME) \
		--network $(NETWORK_NAME) \
		--restart unless-stopped \
		-e MYSQL_ROOT_PASSWORD=$(DB_ROOT_PASSWORD) \
		-e MYSQL_DATABASE=$(DB_NAME) \
		-e MYSQL_USER=$(DB_USER) \
		-e MYSQL_PASSWORD=$(DB_PASSWORD) \
		-p 3306:3306 \
		-v ucloud_mariadb_data:/var/lib/mysql \
		mariadb:10.11
	@echo "3️⃣ Waiting for MariaDB to be ready..."
	@sleep 20
	@echo "4️⃣ Starting UCloud Status application..."
	docker run -d \
		--name $(APP_NAME) \
		--network $(NETWORK_NAME) \
		--restart unless-stopped \
		-p 3000:3000 \
		-e NODE_ENV=production \
		-e PORT=3001 \
		-e DATABASE_URL=mysql://$(DB_USER):$(DB_PASSWORD)@$(MARIADB_NAME):3306/$(DB_NAME) \
		-e SHADOW_DATABASE_URL="" \
		-e PRISMA_LOG_LEVEL=error \
		-e CORS_ORIGIN=http://localhost:3000 \
		$(IMAGE_NAME):$(VERSION)

# Run with MariaDB on shared network
run-with-db: mariadb-start
	@echo "🚀 Starting application with database..."
	@docker run -d \
		--name $(APP_NAME) \
		--network $(NETWORK_NAME) \
		--restart unless-stopped \
		-p 3000:3001 \
		-e NODE_ENV=production \
		-e PORT=3001 \
		-e DATABASE_URL=mysql://$(DB_USER):$(DB_PASSWORD)@$(MARIADB_NAME):3306/$(DB_NAME) \
		-e SHADOW_DATABASE_URL="" \
		-e PRISMA_LOG_LEVEL=error \
		-e CORS_ORIGIN=http://localhost:3000 \
		$(IMAGE_NAME):$(VERSION) 2>/dev/null || echo "Application container already running"

	@echo "🎉 Setup complete!"
	@echo "📊 Application: http://localhost:3000"
	@echo "🗄️ Database: localhost:3306"
	@echo ""
	@echo "🔧 Useful commands:"
	@echo "  make logs           - View application logs"
	@echo "  make mariadb-logs   - View database logs"
	@echo "  make db-shell       - Access database"
	@echo "  make status         - Check status"

# Show application logs
logs:
	@docker logs -f $(APP_NAME)

# Show container and network status
status:
	@echo "📊 Container Status:"
	@docker ps --filter "name=$(APP_NAME)" --filter "name=$(MARIADB_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "No containers running"
	@echo ""
	@echo "🌐 Network Status:"
	@docker network ls --filter "name=$(NETWORK_NAME)" --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}" 2>/dev/null || echo "Network not found"

# Health check
health:
	@echo "🔍 Health Check:"
	@echo "Database:"
	@docker exec $(MARIADB_NAME) mariadb-admin ping -h localhost -u root -p$(DB_ROOT_PASSWORD) 2>/dev/null && echo "✅ Database: Healthy" || echo "❌ Database: Unhealthy"
	@echo "Application:"
	@curl -s http://localhost:3000/api/health | jq '.status' 2>/dev/null && echo "✅ Application: Healthy" || echo "❌ Application: Unhealthy"

# Start existing containers
start:
	@echo "▶️ Starting existing containers..."
	@docker start $(MARIADB_NAME) 2>/dev/null || echo "MariaDB not found"
	@docker start $(APP_NAME) 2>/dev/null || echo "Application not found"

# Stop containers
stop:
	@echo "⏹️ Stopping containers..."
	@docker stop $(APP_NAME) 2>/dev/null || echo "Application container not running"
	@docker stop $(MARIADB_NAME) 2>/dev/null || echo "MariaDB container not running"

# Restart containers
restart: stop start

# Push to Docker Hub
push: tag
	@echo "Authenticating with PAT..."
	@echo $(DOCKER_PAT) | docker login -u $(DOCKER_USERNAME) --password-stdin
	@echo "Pushing images..."
	docker push $(IMAGE_NAME):$(VERSION)
	docker push $(IMAGE_NAME):latest
	docker push $(IMAGE_NAME):v$(VERSION)
	@docker logout
	@echo "Push completed!"

# Build, tag and push (for deployment)
deploy: build tag push
	@echo ""
	@echo "✅ Deployment completed!"
	@echo "Image $(IMAGE_NAME):$(VERSION) is now available on Docker Hub"
	@echo ""
	@echo "Available tags:"
	@echo "  - $(IMAGE_NAME):$(VERSION)"
	@echo "  - $(IMAGE_NAME):latest"
	@echo "  - $(IMAGE_NAME):v$(VERSION)"

# Install on Cloudron
cloudron-install:
	@echo "Installing $(IMAGE_NAME):$(VERSION) on Cloudron..."
		cloudron install --image $(IMAGE_NAME):$(VERSION) \
    		--location test.ucloud.hu

# Install specific version on Cloudron
cloudron-install-latest:
	@echo "Installing $(IMAGE_NAME):latest on Cloudron..."
	cloudron install --image $(IMAGE_NAME):latest

# Uninstall from Cloudron
cloudron-uninstall:
	@echo "Uninstalling from Cloudron..."
	cloudron uninstall --app test.ucloud.hu

# Clean up containers and images
clean:
	@echo "🧹 Cleaning up containers..."
	docker compose -f docker-compose.local.yml down 2>/dev/null || true
	docker stop $(APP_NAME) 2>/dev/null || true
	docker stop $(MARIADB_NAME) 2>/dev/null || true
	docker rm $(APP_NAME) 2>/dev/null || true
	docker rm $(MARIADB_NAME) 2>/dev/null || true
	@echo "Cleanup completed!"

# Full cleanup including network and volumes
clean-all: clean
	@echo "🧹 Full cleanup (network and volumes)..."
	docker network rm $(NETWORK_NAME) 2>/dev/null || true
	docker volume rm ucloud_mariadb_data 2>/dev/null || true
	docker rmi $(IMAGE_NAME):$(VERSION) 2>/dev/null || true
	docker rmi $(IMAGE_NAME):latest 2>/dev/null || true
	docker rmi $(IMAGE_NAME):v$(VERSION) 2>/dev/null || true
	@echo "Full cleanup completed!"

# Build and run complete stack (for testing)
build-run-full: build run-full

# Build and run locally (standalone)
build-run: build run

# Show current version
version:
	@echo "Current version: $(VERSION)"
	@echo "Image name: $(IMAGE_NAME)"

# List all available tags
list-tags:
	@echo "Checking available tags on Docker Hub..."
	@docker search $(IMAGE_NAME) --limit 1 || echo "Image not found on Docker Hub"