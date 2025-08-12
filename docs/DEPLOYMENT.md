# Deployment Guide

## Overview
This guide covers deploying both the Personal Research Notebook and LIMS applications to production environments.

## Prerequisites
- Production server with Node.js 18+
- PostgreSQL 14+ database
- Reverse proxy (Nginx/Apache)
- SSL certificates
- Domain names configured

## Architecture Options

### Option 1: Monolithic Deployment
All services on a single server with different ports.

### Option 2: Microservices Deployment
Separate servers for each service with load balancing.

### Option 3: Containerized Deployment
Docker containers with orchestration (Docker Compose/Kubernetes).

## Environment Setup

### Production Environment Variables

**Personal API** (`servers/personal-api/.env`):
```env
NODE_ENV=production
DATABASE_URL="postgresql://username:password@host:5432/research_notebook_personal"
PORT=3001
JWT_SECRET="your-production-jwt-secret"
SESSION_SECRET="your-production-session-secret"
LOG_LEVEL="info"
```

**LIMS API** (`servers/lims-api/.env`):
```env
NODE_ENV=production
DATABASE_URL="postgresql://username:password@host:5432/research_notebook_lims"
PORT=3002
JWT_SECRET="your-production-jwt-secret"
SESSION_SECRET="your-production-session-secret"
LOG_LEVEL="info"
```

**Personal App** (build-time):
```env
VITE_API_URL="https://api.yourdomain.com/personal"
VITE_APP_TITLE="Research Notebook"
```

**LIMS App** (build-time):
```env
VITE_API_URL="https://api.yourdomain.com/lims"
VITE_APP_TITLE="LIMS"
```

## Database Deployment

### 1. Production Database Setup
```bash
# Create production databases
createdb research_notebook_personal_prod
createdb research_notebook_lims_prod

# Run migrations
cd servers/personal-api
NODE_ENV=production pnpm prisma migrate deploy

cd ../lims-api
NODE_ENV=production pnpm prisma migrate deploy
```

### 2. Database Security
- Use strong passwords
- Restrict network access
- Enable SSL connections
- Regular backups
- Monitor performance

## Application Deployment

### 1. Build Applications
```bash
# Build frontend apps
cd apps/personal
pnpm run build

cd ../lims
pnpm run build

# Build backend APIs
cd servers/personal-api
pnpm run build

cd ../lims-api
pnpm run build
```

### 2. Deploy to Server
```bash
# Copy built files to server
scp -r apps/personal/dist user@server:/var/www/personal
scp -r apps/lims/dist user@server:/var/www/lims
scp -r servers/personal-api/dist user@server:/var/www/personal-api
scp -r servers/lims-api/dist user@server:/var/www/lims-api
```

### 3. Install Dependencies
```bash
# On production server
cd /var/www/personal-api
pnpm install --production

cd /var/www/lims-api
pnpm install --production
```

## Reverse Proxy Configuration

### Nginx Configuration

**Main Server Block** (`/etc/nginx/sites-available/research-notebook`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    # SSL configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Personal App
    location / {
        root /var/www/personal;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # LIMS App
    location /lims {
        alias /var/www/lims;
        try_files $uri $uri/ /index.html;
    }
    
    # Personal API
    location /api/personal {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # LIMS API
    location /api/lims {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/research-notebook /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Process Management

### PM2 Configuration

**Personal API** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'personal-api',
    script: 'dist/server.js',
    cwd: '/var/www/personal-api',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/personal-api/error.log',
    out_file: '/var/log/personal-api/out.log',
    log_file: '/var/log/personal-api/combined.log',
    time: true
  }]
};
```

**LIMS API** (`ecosystem.config.js`):
```javascript
module.exports = {
  apps: [{
    name: 'lims-api',
    script: 'dist/server.js',
    cwd: '/var/www/lims-api',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: '/var/log/lims-api/error.log',
    out_file: '/var/log/lims-api/out.log',
    log_file: '/var/log/lims-api/combined.log',
    time: true
  }]
};
```

### Start Services
```bash
# Start APIs
cd /var/www/personal-api
pm2 start ecosystem.config.js

cd /var/www/lims-api
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

## Docker Deployment

### Docker Compose

**`docker-compose.yml`**:
```yaml
version: '3.8'

services:
  personal-api:
    build: ./servers/personal-api
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://username:password@db:5432/research_notebook_personal
    depends_on:
      - db
    restart: unless-stopped

  lims-api:
    build: ./servers/lims-api
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://username:password@db:5432/research_notebook_lims
    depends_on:
      - db
    restart: unless-stopped

  personal-app:
    build: ./apps/personal
    ports:
      - "80:80"
    depends_on:
      - personal-api
    restart: unless-stopped

  lims-app:
    build: ./apps/lims
    ports:
      - "8080:80"
    depends_on:
      - lims-api
    restart: unless-stopped

  db:
    image: postgres:14
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_USER=username
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Build and Deploy
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Monitoring and Logging

### Application Monitoring
- PM2 monitoring dashboard
- Application metrics
- Error tracking (Sentry)
- Performance monitoring

### Log Management
```bash
# View logs
pm2 logs personal-api
pm2 logs lims-api

# Log rotation
sudo logrotate /etc/logrotate.d/pm2
```

### Health Checks
```bash
# API health endpoints
curl https://yourdomain.com/api/personal/health
curl https://yourdomain.com/api/lims/health
```

## Security Considerations

### SSL/TLS
- Use Let's Encrypt for free certificates
- Enable HTTP/2
- Configure security headers
- Regular certificate renewal

### Firewall
```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### Database Security
- Network isolation
- Strong authentication
- Regular security updates
- Backup encryption

## Backup Strategy

### Database Backups
```bash
# Automated daily backups
pg_dump research_notebook_personal > backup_personal_$(date +%Y%m%d).sql
pg_dump research_notebook_lims > backup_lims_$(date +%Y%m%d).sql

# Compress and archive
gzip backup_*.sql
```

### Application Backups
- Source code version control
- Configuration files backup
- Build artifacts backup
- Disaster recovery plan

## Scaling Considerations

### Horizontal Scaling
- Load balancer configuration
- Database read replicas
- CDN for static assets
- Microservices architecture

### Performance Optimization
- Database query optimization
- Caching strategies
- Asset compression
- CDN implementation

## Maintenance

### Regular Tasks
- Security updates
- Database maintenance
- Log rotation
- Performance monitoring
- Backup verification

### Update Process
1. Test in staging environment
2. Backup production data
3. Deploy updates
4. Verify functionality
5. Monitor for issues

## Troubleshooting

### Common Issues
- Port conflicts
- Database connection failures
- SSL certificate issues
- Memory leaks
- Performance degradation

### Debug Commands
```bash
# Check service status
pm2 status
pm2 logs

# Check nginx status
sudo systemctl status nginx
sudo nginx -t

# Check database
psql -h localhost -U username -d research_notebook_personal
```
