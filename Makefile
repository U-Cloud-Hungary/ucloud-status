# ===========================================
# Makefile for Docker operations
# ===========================================

IMAGE_NAME = turizoltan96/ucaloudstatus
VERSION = 1.0.0

.PHONY: compose build run clean help push deploy cloudron-install cloudron-uninstall tag

# Default target
help:
	@echo "Available commands:"
	@echo "  make compose         - Start services with docker-compose"
	@echo "  make build           - Build the Docker image"
	@echo "  make run             - Run the container locally on port 3000"
	@echo "  make tag             - Create version and latest tags"
	@echo "  make push            - Push image to Docker Hub"
	@echo "  make deploy          - Build, tag and push to Docker Hub"
	@echo "  make cloudron-install - Install app on Cloudron"
	@echo "  make cloudron-uninstall - Uninstall app from Cloudron"
	@echo "  make clean           - Stop and remove containers"
	@echo "  make help            - Show this help message"
	@echo ""
	@echo "Version: $(VERSION)"
	@echo "Image: $(IMAGE_NAME)"

# Start docker-compose services
compose:
	docker compose -f docker-compose.local.yml up -d

# Build the Docker image
build:
	@echo "Building $(IMAGE_NAME):$(VERSION)..."
	docker build -t $(IMAGE_NAME):$(VERSION) -f Dockerfile .
	@echo "Build completed!"

# Create tags
tag: build
	@echo "Creating tags..."
	docker tag $(IMAGE_NAME):$(VERSION) $(IMAGE_NAME):latest
	docker tag $(IMAGE_NAME):$(VERSION) $(IMAGE_NAME):v$(VERSION)
	@echo "Tags created:"
	@echo "  - $(IMAGE_NAME):$(VERSION)"
	@echo "  - $(IMAGE_NAME):latest"
	@echo "  - $(IMAGE_NAME):v$(VERSION)"

# Run the container locally
run:
	@echo "Starting container on port 3000..."
	docker run -p 3000:3000 --name ucaloudstatus-local $(IMAGE_NAME):$(VERSION)

# Push to Docker Hub
push: tag
	@echo "Pushing to Docker Hub..."
	docker push $(IMAGE_NAME):$(VERSION)
	docker push $(IMAGE_NAME):latest
	docker push $(IMAGE_NAME):v$(VERSION)
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
	cloudron install --image $(IMAGE_NAME):$(VERSION)

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
	@echo "Cleaning up..."
	docker compose -f docker-compose.local.yml down 2>/dev/null || true
	docker stop ucaloudstatus-local 2>/dev/null || true
	docker rm ucaloudstatus-local 2>/dev/null || true
	docker rmi $(IMAGE_NAME):$(VERSION) 2>/dev/null || true
	docker rmi $(IMAGE_NAME):latest 2>/dev/null || true
	docker rmi $(IMAGE_NAME):v$(VERSION) 2>/dev/null || true
	@echo "Cleanup completed!"

# Build and run locally (for testing)
build-run: build run

# Show current version
version:
	@echo "Current version: $(VERSION)"
	@echo "Image name: $(IMAGE_NAME)"

# List all available tags
list-tags:
	@echo "Checking available tags on Docker Hub..."
	@docker search $(IMAGE_NAME) --limit 1 || echo "Image not found on Docker Hub"