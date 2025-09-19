#!/bin/bash

# SUPER AUTOMATED VPS DEPLOYMENT SCRIPT
# This script will set up everything automatically on your Hostinger VPS
# Just run: curl -sSL https://raw.githubusercontent.com/aedentek/CRM/main/super-deploy.sh | bash

set -e  # Exit on any error

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
VPS_IP="72.60.97.211"
PROJECT_DIR="/var/www/Aedentek-CRM"
BACKEND_DIR="$PROJECT_DIR/backend"
GITHUB_REPO="https://github.com/aedentek/Aedentek-CRM.git"
APP_NAME="crm-backend"
DOMAIN="api.gandhibaideaddictioncenter.com"
FRONTEND_DOMAIN="admin.gandhibaideaddictioncenter.com"

# Function to print colored output
print_header() {
    echo -e "\n${PURPLE}================================================================${NC}"
    echo -e "${PURPLE}🚀 $1${NC}"
    echo -e "${PURPLE}================================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo -e "\n${CYAN}📋 Step: $1${NC}"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then 
        print_error "Please run this script as root (use sudo)"
        exit 1
    fi
}

# Update system
update_system() {
    print_step "Updating system packages..."
    apt update -y && apt upgrade -y
    print_success "System updated successfully"
}

# Install Node.js
install_nodejs() {
    print_step "Installing Node.js..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
        print_success "Node.js installed: $(node --version)"
    else
        print_info "Node.js already installed: $(node --version)"
    fi
}

# Install PM2
install_pm2() {
    print_step "Installing PM2..."
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
        print_success "PM2 installed: $(pm2 --version)"
    else
        print_info "PM2 already installed: $(pm2 --version)"
    fi
}

# Install Nginx
install_nginx() {
    print_step "Installing Nginx..."
    if ! command -v nginx &> /dev/null; then
        apt install nginx -y
        systemctl enable nginx
        systemctl start nginx
        print_success "Nginx installed and started"
    else
        print_info "Nginx already installed"
        systemctl enable nginx
        systemctl start nginx || true
    fi
}

# Install other dependencies
install_dependencies() {
    print_step "Installing additional dependencies..."
    apt install -y git curl wget unzip software-properties-common ufw certbot python3-certbot-nginx
    print_success "Dependencies installed"
}

# Clone repository
clone_repository() {
    print_step "Setting up project directory..."
    
    # Remove existing directory if it exists
    if [ -d "$PROJECT_DIR" ]; then
        print_warning "Removing existing project directory..."
        rm -rf "$PROJECT_DIR"
    fi
    
    # Create parent directory
    mkdir -p /var/www
    cd /var/www
    
    # Clone repository
    print_info "Cloning repository from GitHub..."
    git clone "$GITHUB_REPO" Aedentek-CRM
    
    print_success "Repository cloned successfully"
}

# Set up backend
setup_backend() {
    print_step "Setting up backend..."
    
    cd "$BACKEND_DIR"
    
    # Install dependencies
    print_info "Installing Node.js dependencies..."
    npm install --production
    
    # Create environment file
    print_info "Setting up environment configuration..."
    cat > .env << EOF
# Database (using production database)
DB_HOST=srv1639.hstgr.io
DB_USER=u745362362_crmusername
DB_PASSWORD="Aedentek@123#"
DB_NAME=u745362362_crm
DB_PORT=3306

# Server ports
API_PORT=4000
PORT=4000

# Production URLs
VITE_API_URL=http://${VPS_IP}:4000/api
VITE_BASE_URL=https://${FRONTEND_DOMAIN}

NODE_ENV=production
VPS_IP=${VPS_IP}
EOF

    # Set proper permissions
    chown -R www-data:www-data "$PROJECT_DIR"
    chmod -R 755 "$PROJECT_DIR"
    
    print_success "Backend setup completed"
}

# Configure PM2
setup_pm2() {
    print_step "Configuring PM2..."
    
    cd "$BACKEND_DIR"
    
    # Stop existing processes
    pm2 stop "$APP_NAME" 2>/dev/null || true
    pm2 delete "$APP_NAME" 2>/dev/null || true
    
    # Start application
    pm2 start index.js --name "$APP_NAME" --env production
    
    # Save PM2 process list
    pm2 save
    
    # Set up PM2 startup
    pm2 startup systemd -u root --hp /root
    
    print_success "PM2 configured and application started"
}

# Configure Nginx
setup_nginx() {
    print_step "Configuring Nginx..."
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/crm-api << EOF
server {
    listen 80;
    server_name ${VPS_IP} ${DOMAIN};
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
    
    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://${FRONTEND_DOMAIN}' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With' always;
        
        # Handle preflight requests
        if (\$request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://${FRONTEND_DOMAIN}';
            add_header 'Access-Control-Allow-Credentials' 'true';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Requested-With';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://localhost:4000/health;
        proxy_set_header Host \$host;
    }
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/crm-api /etc/nginx/sites-enabled/
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Test and reload Nginx
    nginx -t
    systemctl reload nginx
    
    print_success "Nginx configured successfully"
}

# Configure firewall
setup_firewall() {
    print_step "Configuring firewall..."
    
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 4000/tcp
    ufw --force enable
    
    print_success "Firewall configured"
}

# Health check
health_check() {
    print_step "Performing health check..."
    
    sleep 5  # Wait for services to start
    
    # Check PM2 process
    if pm2 list | grep -q "$APP_NAME"; then
        print_success "PM2 process is running"
    else
        print_error "PM2 process is not running"
    fi
    
    # Check port 4000
    if netstat -tulpn | grep -q ":4000"; then
        print_success "Port 4000 is listening"
    else
        print_error "Port 4000 is not listening"
    fi
    
    # Check Nginx
    if systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
    else
        print_error "Nginx is not running"
    fi
    
    # Test API endpoint
    if curl -s "http://localhost:4000" > /dev/null; then
        print_success "API is responding"
    else
        print_warning "API might not be responding yet (this is normal, may take a moment)"
    fi
}

# Create management script
create_management_script() {
    print_step "Creating management script..."
    
    # Copy the management script from the repository
    cp "$PROJECT_DIR/manage-vps.sh" /usr/local/bin/crm-manage
    chmod +x /usr/local/bin/crm-manage
    
    print_success "Management script created at: /usr/local/bin/crm-manage"
}

# Main deployment function
main() {
    print_header "🚀 SUPER AUTOMATED CRM BACKEND DEPLOYMENT"
    
    print_info "VPS IP: $VPS_IP"
    print_info "Project Directory: $PROJECT_DIR"
    print_info "Application Name: $APP_NAME"
    print_info "Repository: $GITHUB_REPO"
    
    # Run all deployment steps
    check_root
    update_system
    install_dependencies
    install_nodejs
    install_pm2
    install_nginx
    clone_repository
    setup_backend
    setup_pm2
    setup_nginx
    setup_firewall
    create_management_script
    health_check
    
    print_header "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    
    echo -e "${GREEN}Your CRM Backend is now running on:${NC}"
    echo -e "${CYAN}🌐 Direct IP: http://$VPS_IP:4000${NC}"
    echo -e "${CYAN}🌐 Nginx Proxy: http://$VPS_IP${NC}"
    echo -e "${CYAN}📊 PM2 Status: pm2 status${NC}"
    echo -e "${CYAN}📋 Management: crm-manage help${NC}"
    echo -e "${CYAN}📝 Logs: pm2 logs $APP_NAME${NC}"
    
    print_warning "Next Steps:"
    echo -e "${YELLOW}1. Update your frontend API URL to: http://$VPS_IP:4000/api${NC}"
    echo -e "${YELLOW}2. Test all API endpoints${NC}"
    echo -e "${YELLOW}3. Optionally set up SSL with: certbot --nginx${NC}"
    echo -e "${YELLOW}4. Point your domain to this VPS IP: $VPS_IP${NC}"
    
    print_success "🎯 Migration from Render to VPS completed!"
}

# Run main function
main "$@"