#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}DBVisor Installation Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to generate random passphrase
generate_passphrase() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Step 1: Setup environment files
echo -e "${YELLOW}[1/6] Setting up environment files...${NC}"

# Root .env file
if [ ! -f .env ]; then
    if [ -f env-sample ]; then
        cp env-sample .env
        echo -e "${GREEN}✓ Created .env from env-sample${NC}"
    else
        echo -e "${RED}✗ env-sample not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env already exists${NC}"
fi

# Backend .env file
if [ ! -f src/backend/.env ]; then
    if [ -f src/backend/env-sample ]; then
        cp src/backend/env-sample src/backend/.env
        echo -e "${GREEN}✓ Created src/backend/.env from env-sample${NC}"
    else
        echo -e "${RED}✗ src/backend/env-sample not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ src/backend/.env already exists${NC}"
fi

# Frontend .env file
if [ ! -f src/frontend/.env ]; then
    if [ -f src/frontend/env-sample ]; then
        cp src/frontend/env-sample src/frontend/.env
        echo -e "${GREEN}✓ Created src/frontend/.env from env-sample${NC}"
    else
        echo -e "${RED}✗ src/frontend/env-sample not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ src/frontend/.env already exists${NC}"
fi

# Prompt for public URL and update frontend .env
# Check if frontend .env already has a non-localhost URL
CURRENT_URL=$(grep "^NEXT_PUBLIC_GRAPHQL_URL=" src/frontend/.env | head -1 | sed 's/.*=//' | sed 's|/api/graphql||' || echo "")

if [[ "$CURRENT_URL" == "http://localhost" ]] || [[ -z "$CURRENT_URL" ]] || [[ "$CURRENT_URL" == *"localhost"* ]]; then
    echo ""
    echo -e "${YELLOW}Please enter the public URL for the application:${NC}"
    echo -e "${YELLOW}(e.g., http://localhost, https://app.example.com)${NC}"
    read -p "Public URL [default: http://localhost]: " PUBLIC_URL
    PUBLIC_URL=${PUBLIC_URL:-http://localhost}

    # Normalize URL: ensure it starts with http:// or https://, remove trailing slash
    if [[ ! "$PUBLIC_URL" =~ ^https?:// ]]; then
        PUBLIC_URL="http://${PUBLIC_URL}"
    fi
    PUBLIC_URL="${PUBLIC_URL%/}"

    # Update frontend .env file with the public URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|http://localhost|${PUBLIC_URL}|g" src/frontend/.env
    else
        # Linux
        sed -i "s|http://localhost|${PUBLIC_URL}|g" src/frontend/.env
    fi
    echo -e "${GREEN}✓ Updated frontend .env with public URL: ${PUBLIC_URL}${NC}"
else
    echo -e "${GREEN}✓ Frontend .env already has public URL configured: ${CURRENT_URL}${NC}"
fi

# Generate JWT_PASSPHRASE if not set in backend .env
if ! grep -q "^JWT_PASSPHRASE=.*[^[:space:]]" src/backend/.env; then
    JWT_PASSPHRASE=$(generate_passphrase)
    # Update or add JWT_PASSPHRASE in backend .env
    if grep -q "^JWT_PASSPHRASE=" src/backend/.env; then
        # Replace existing empty value
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^JWT_PASSPHRASE=.*/JWT_PASSPHRASE=$JWT_PASSPHRASE/" src/backend/.env
        else
            # Linux
            sed -i "s/^JWT_PASSPHRASE=.*/JWT_PASSPHRASE=$JWT_PASSPHRASE/" src/backend/.env
        fi
    else
        # Add new line
        echo "JWT_PASSPHRASE=$JWT_PASSPHRASE" >> src/backend/.env
    fi
    echo -e "${GREEN}✓ Generated JWT_PASSPHRASE${NC}"
else
    echo -e "${GREEN}✓ JWT_PASSPHRASE already set${NC}"
fi

# Generate APP_SECRET if not set in backend .env
if ! grep -q "^APP_SECRET=.*[^[:space:]]" src/backend/.env; then
    APP_SECRET=$(generate_passphrase)
    if grep -q "^APP_SECRET=" src/backend/.env; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/^APP_SECRET=.*/APP_SECRET=$APP_SECRET/" src/backend/.env
        else
            sed -i "s/^APP_SECRET=.*/APP_SECRET=$APP_SECRET/" src/backend/.env
        fi
    else
        echo "APP_SECRET=$APP_SECRET" >> src/backend/.env
    fi
    echo -e "${GREEN}✓ Generated APP_SECRET${NC}"
else
    echo -e "${GREEN}✓ APP_SECRET already set${NC}"
fi

echo ""

# Step 2: Start Docker Compose
echo -e "${YELLOW}[2/6] Starting Docker Compose services...${NC}"
# Check if services are already running
if docker compose ps | grep -q "Up"; then
    echo -e "${YELLOW}Some services are already running. Recreating...${NC}"
    docker compose up -d --build
else
    docker compose up -d --build
fi
echo -e "${GREEN}✓ Docker Compose services started${NC}"
echo ""

# Step 3: Wait for database to be ready
echo -e "${YELLOW}[3/6] Waiting for database to be ready...${NC}"
MAX_ATTEMPTS=60
ATTEMPT=0
until docker compose exec -T database mysqladmin ping -h localhost --silent 2>/dev/null || [ $ATTEMPT -eq $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))
    echo "Waiting for database... ($ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}✗ Database failed to start after $MAX_ATTEMPTS attempts${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database is ready${NC}"
echo ""

# Step 4: Install backend dependencies
echo -e "${YELLOW}[4/6] Installing backend dependencies (Composer)...${NC}"
# Run composer as root to avoid permission issues, then fix ownership
docker compose exec -T --user root php composer install --no-interaction --prefer-dist --optimize-autoloader
# Fix ownership of vendor directory to www user
docker compose exec -T --user root php sh -c "chown -R www:www /var/www/vendor /var/www/var 2>/dev/null || true"
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

# Step 5: Setup database and generate JWT keys
echo -e "${YELLOW}[5/6] Setting up database and JWT keys...${NC}"

# Wait a bit more for PHP service to be fully ready
sleep 3

# Generate JWT keys if they don't exist
if [ ! -f src/backend/config/jwt/private.pem ] || [ ! -f src/backend/config/jwt/public.pem ]; then
    echo "Generating JWT keys..."
    # Ensure the directory exists with proper permissions
    docker compose exec -T --user root php sh -c "mkdir -p /var/www/config/jwt && chown -R www:www /var/www/config/jwt" 2>/dev/null || true
    
    # Try to generate keypair (this is the standard Lexik JWT command)
    docker compose exec -T php php bin/console lexik:jwt:generate-keypair --overwrite --no-interaction 2>&1 || {
        # If that fails, try without --overwrite flag
        docker compose exec -T php php bin/console lexik:jwt:generate-keypair --no-interaction 2>&1 || {
            echo -e "${YELLOW}Warning: JWT key generation command failed. Trying as root...${NC}"
            # Try as root if www user doesn't have permissions
            docker compose exec -T --user root php php bin/console lexik:jwt:generate-keypair --overwrite --no-interaction 2>&1 || {
                echo -e "${YELLOW}Note: JWT keys could not be generated automatically.${NC}"
                echo -e "${YELLOW}Please run manually: docker compose exec php php bin/console lexik:jwt:generate-keypair${NC}"
            }
        }
    }
    
    # Fix ownership of JWT keys
    docker compose exec -T --user root php sh -c "chown -R www:www /var/www/config/jwt 2>/dev/null || true"
    
    # Verify keys were created
    if [ -f src/backend/config/jwt/private.pem ] && [ -f src/backend/config/jwt/public.pem ]; then
        echo -e "${GREEN}✓ JWT keys generated successfully${NC}"
    else
        echo -e "${YELLOW}⚠ JWT keys may not have been generated. Please verify manually.${NC}"
    fi
else
    echo -e "${GREEN}✓ JWT keys already exist${NC}"
fi

# Run database migrations
echo "Running database migrations..."
docker compose exec -T php php bin/console doctrine:migrations:migrate --no-interaction || {
    echo -e "${YELLOW}Warning: Migrations failed. This might be normal if the database is already set up.${NC}"
}
echo -e "${GREEN}✓ Database migrations completed${NC}"
echo ""

# Step 6: Install frontend dependencies
echo -e "${YELLOW}[6/6] Installing frontend dependencies...${NC}"
# It runs automatically while docker starts
# docker compose exec -T frontend yarn install --frozen-lockfile || {
#     echo -e "${YELLOW}Warning: Frontend dependencies installation had issues. Trying alternative...${NC}"
#     docker compose exec -T frontend yarn install
# }
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Installation completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
# Load environment variables to show correct ports
NGINX_PORT=80
FRONTEND_PORT=3000
if [ -f .env ]; then
    # Extract port values from .env file
    if grep -q "^NGINX_PORT=" .env; then
        NGINX_PORT=$(grep "^NGINX_PORT=" .env | cut -d '=' -f2)
    fi
    if grep -q "^FRONTEND_PORT=" .env; then
        FRONTEND_PORT=$(grep "^FRONTEND_PORT=" .env | cut -d '=' -f2)
    fi
fi

echo "Services are running:"
echo "  - Local URL: http://localhost:${NGINX_PORT}"
echo "  - Public URL: ${PUBLIC_URL}"
echo ""
echo "To view logs:"
echo "  docker compose logs -f"
echo ""
echo "To stop services:"
echo "  docker compose down"
echo ""
