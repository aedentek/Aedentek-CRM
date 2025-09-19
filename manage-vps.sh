#!/bin/bash

# VPS Management Script for CRM Backend
# Provides easy commands to manage your CRM backend on VPS

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="crm-backend"
PROJECT_DIR="/var/www/Aedentek-CRM"
BACKEND_DIR="$PROJECT_DIR/backend"

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

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to show usage
show_usage() {
    echo "CRM Backend VPS Management Script"
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start       Start the backend application"
    echo "  stop        Stop the backend application"
    echo "  restart     Restart the backend application"
    echo "  status      Show application status"
    echo "  logs        Show application logs"
    echo "  update      Update application from Git"
    echo "  deploy      Full deployment (update + restart)"
    echo "  monitor     Real-time monitoring"
    echo "  backup-db   Backup database"
    echo "  health      Check application health"
    echo "  nginx       Manage Nginx"
    echo "  help        Show this help message"
}

# Function to start application
start_app() {
    print_header "Starting CRM Backend"
    cd $BACKEND_DIR
    pm2 start ecosystem.config.json --env production
    print_status "Application started successfully"
}

# Function to stop application
stop_app() {
    print_header "Stopping CRM Backend"
    pm2 stop $APP_NAME
    print_status "Application stopped successfully"
}

# Function to restart application
restart_app() {
    print_header "Restarting CRM Backend"
    pm2 restart $APP_NAME
    print_status "Application restarted successfully"
}

# Function to show status
show_status() {
    print_header "Application Status"
    pm2 status $APP_NAME
    echo ""
    print_status "System Resources:"
    echo "Memory Usage: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
    echo "Disk Usage: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"
    echo "CPU Load: $(uptime | awk -F'load average:' '{print $2}')"
}

# Function to show logs
show_logs() {
    print_header "Application Logs"
    pm2 logs $APP_NAME --lines 50
}

# Function to update application
update_app() {
    print_header "Updating CRM Backend"
    cd $PROJECT_DIR
    
    print_status "Pulling latest changes from Git..."
    git pull origin main
    
    print_status "Installing/updating dependencies..."
    cd $BACKEND_DIR
    npm install --production
    
    print_status "Update completed successfully"
}

# Function for full deployment
deploy_app() {
    print_header "Full Deployment"
    update_app
    restart_app
    show_status
    print_status "Deployment completed successfully"
}

# Function for real-time monitoring
monitor_app() {
    print_header "Real-time Monitoring"
    pm2 monit
}

# Function to backup database
backup_db() {
    print_header "Database Backup"
    BACKUP_DIR="/var/backups/crm"
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/crm_backup_$DATE.sql"
    
    mkdir -p $BACKUP_DIR
    
    print_status "Creating database backup..."
    # Note: You'll need to replace these with your actual DB credentials
    mysqldump -h srv1639.hstgr.io -u u745362362_crmusername -p u745362362_crm > $BACKUP_FILE
    
    if [ $? -eq 0 ]; then
        print_status "Database backed up to: $BACKUP_FILE"
        # Compress the backup
        gzip $BACKUP_FILE
        print_status "Backup compressed: $BACKUP_FILE.gz"
    else
        print_error "Database backup failed"
    fi
}

# Function to check application health
check_health() {
    print_header "Health Check"
    
    # Check if PM2 process is running
    if pm2 list | grep -q $APP_NAME; then
        print_status "✅ PM2 process is running"
    else
        print_error "❌ PM2 process is not running"
    fi
    
    # Check if port 4000 is listening
    if netstat -tulpn | grep -q ":4000"; then
        print_status "✅ Port 4000 is listening"
    else
        print_error "❌ Port 4000 is not listening"
    fi
    
    # Check database connectivity
    print_status "🔍 Checking database connectivity..."
    cd $BACKEND_DIR
    timeout 10 node -e "
        import db from './db/config.js';
        try {
            await db.execute('SELECT 1');
            console.log('✅ Database connection successful');
            process.exit(0);
        } catch (error) {
            console.log('❌ Database connection failed:', error.message);
            process.exit(1);
        }
    " 2>/dev/null || print_error "❌ Database connection test failed"
    
    # Check Nginx status
    if systemctl is-active --quiet nginx; then
        print_status "✅ Nginx is running"
    else
        print_error "❌ Nginx is not running"
    fi
}

# Function to manage Nginx
manage_nginx() {
    print_header "Nginx Management"
    echo "1. Status"
    echo "2. Start"
    echo "3. Stop"
    echo "4. Restart"
    echo "5. Reload"
    echo "6. Test configuration"
    read -p "Choose an option (1-6): " choice
    
    case $choice in
        1) systemctl status nginx ;;
        2) systemctl start nginx && print_status "Nginx started" ;;
        3) systemctl stop nginx && print_status "Nginx stopped" ;;
        4) systemctl restart nginx && print_status "Nginx restarted" ;;
        5) systemctl reload nginx && print_status "Nginx reloaded" ;;
        6) nginx -t ;;
        *) print_error "Invalid option" ;;
    esac
}

# Main script logic
case "$1" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    update)
        update_app
        ;;
    deploy)
        deploy_app
        ;;
    monitor)
        monitor_app
        ;;
    backup-db)
        backup_db
        ;;
    health)
        check_health
        ;;
    nginx)
        manage_nginx
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        show_usage
        exit 1
        ;;
esac