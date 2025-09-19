#!/bin/bash

# VPS Deployment Script for CRM Backend
# Run this script on your Hostinger VPS

echo "🚀 Starting CRM Backend deployment on VPS..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/CRM"
BACKEND_DIR="$PROJECT_DIR/backend"
NGINX_SITES_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
LOG_DIR="/var/log/pm2"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run this script as root (use sudo)"
    exit 1
fi

# Step 1: Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Step 2: Install Node.js if not installed
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
else
    print_status "Node.js already installed: $(node --version)"
fi

# Step 3: Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    npm install -g pm2
else
    print_status "PM2 already installed: $(pm2 --version)"
fi

# Step 4: Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    print_status "Installing Nginx..."
    apt install nginx -y
else
    print_status "Nginx already installed: $(nginx -v 2>&1)"
fi

# Step 5: Create project directory
print_status "Creating project directory..."
mkdir -p $PROJECT_DIR
mkdir -p $LOG_DIR

# Step 6: Clone or update repository
if [ -d "$PROJECT_DIR/.git" ]; then
    print_status "Updating existing repository..."
    cd $PROJECT_DIR
    git pull origin main
else
    print_status "Cloning repository..."
    cd /var/www
    git clone https://github.com/aedentek/CRM.git
fi

# Step 7: Install backend dependencies
print_status "Installing backend dependencies..."
cd $BACKEND_DIR
npm install --production

# Step 8: Copy environment file
if [ ! -f "$BACKEND_DIR/.env" ]; then
    print_warning "No .env file found. Creating from .env.production..."
    if [ -f "$BACKEND_DIR/.env.production" ]; then
        cp .env.production .env
    else
        print_error ".env.production file not found. Please create it manually."
        exit 1
    fi
fi

# Step 9: Set up proper permissions
print_status "Setting up file permissions..."
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR

# Step 10: Configure Nginx
print_status "Configuring Nginx..."
if [ -f "$PROJECT_DIR/nginx-crm-api.conf" ]; then
    cp $PROJECT_DIR/nginx-crm-api.conf $NGINX_SITES_DIR/crm-api
    ln -sf $NGINX_SITES_DIR/crm-api $NGINX_ENABLED_DIR/
    nginx -t
    if [ $? -eq 0 ]; then
        systemctl reload nginx
        print_status "Nginx configuration updated successfully"
    else
        print_error "Nginx configuration test failed"
        exit 1
    fi
else
    print_warning "Nginx configuration file not found. Please configure manually."
fi

# Step 11: Start application with PM2
print_status "Starting application with PM2..."
cd $BACKEND_DIR

# Stop existing process if running
pm2 stop crm-backend 2>/dev/null || true
pm2 delete crm-backend 2>/dev/null || true

# Start new process
if [ -f "ecosystem.config.json" ]; then
    pm2 start ecosystem.config.json --env production
else
    pm2 start index.js --name "crm-backend" --env production
fi

# Save PM2 process list
pm2 save

# Step 12: Set up PM2 startup
print_status "Setting up PM2 startup..."
pm2 startup | tail -1 | bash

# Step 13: Enable firewall rules
print_status "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 4000/tcp
ufw --force enable

print_status "✅ Deployment completed successfully!"
print_status "📊 Application status:"
pm2 status
print_status "📋 Application logs: pm2 logs crm-backend"
print_status "🌐 API should be available at: http://your-domain.com:4000"
print_warning "⚠️  Don't forget to:"
print_warning "   1. Set up SSL certificates"
print_warning "   2. Configure your domain DNS"
print_warning "   3. Update frontend API URLs"
print_warning "   4. Test all API endpoints"