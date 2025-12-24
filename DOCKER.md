# TACC BuildFlow PMS - Docker Deployment Guide

## Quick Start

### 1. Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### 2. Setup Environment Variables

Copy the example environment file:
```bash
cp .env.docker .env
```

Edit `.env` and update the following values:
- `POSTGRES_PASSWORD`: Set a strong password
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: Your production URL

### 3. Build and Run

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

### 4. Access the Application

- Application: http://localhost:3000
- Database: localhost:5432

## Development with Docker

For development with hot reload:

```bash
# Use docker-compose.dev.yml (if created)
docker-compose -f docker-compose.dev.yml up
```

## Production Deployment

### Environment Variables

Ensure these are set in production:

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<your-secret>
```

### Database Migrations

Migrations run automatically on container start. To run manually:

```bash
docker-compose exec app npx prisma migrate deploy
```

### Backup Database

```bash
docker-compose exec postgres pg_dump -U tacc tacc > backup.sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U tacc tacc < backup.sql
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app
docker-compose logs postgres

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database connection issues
```bash
# Verify postgres is healthy
docker-compose ps

# Test connection
docker-compose exec postgres psql -U tacc -d tacc -c "SELECT 1;"
```

### Reset everything
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

## Architecture

```
┌─────────────────┐
│   Next.js App   │ :3000
│   (Container)   │
└────────┬────────┘
         │
         │ DATABASE_URL
         │
┌────────▼────────┐
│   PostgreSQL    │ :5432
│   (Container)   │
└─────────────────┘
```

## Security Notes

1. **Change default passwords** in `.env`
2. **Use secrets management** in production (e.g., Docker Secrets, Vault)
3. **Enable HTTPS** with reverse proxy (nginx, Traefik, Caddy)
4. **Restrict database access** to app container only
5. **Regular backups** of PostgreSQL data

## Performance Optimization

1. **Multi-stage build** reduces final image size
2. **Standalone output** optimizes Next.js for containers
3. **Health checks** ensure services are ready
4. **Volume mounts** persist database data

## Monitoring

Add monitoring services to `docker-compose.yml`:
- Prometheus for metrics
- Grafana for dashboards
- Loki for log aggregation

## Scaling

To scale the application:

```bash
docker-compose up -d --scale app=3
```

Note: Requires load balancer configuration.
