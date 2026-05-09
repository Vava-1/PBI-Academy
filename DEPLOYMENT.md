# PBI Academy - Deployment Guide

This guide will help you deploy the Pacemaker Business Institute (PBI) Academy platform.

## Prerequisites

- Docker & Docker Compose installed
- Git
- At least 4GB RAM available
- Ports 80, 443, 3000, 5432, 6379, 8000 available

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourorg/pbi.git
cd pbi
```

### 2. Environment Configuration

Create environment files:

**Backend (.env)**
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/pbi_db
REDIS_URL=redis://redis:6379/0
SECRET_KEY=your-super-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
OPENAI_API_KEY=sk-your-openai-key-here
ABACUS_AI_API_KEY=your-abacus-key-here
STRIPE_SECRET_KEY=sk_test_your-stripe-key
ENVIRONMENT=development
```

**Frontend (.env)**
```bash
cd frontend
cp .env.example .env
```

Edit `.env` with your configuration:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

### 3. Start All Services

```bash
cd pbi
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- FastAPI backend (port 8000)
- React frontend (port 3000)
- Nginx reverse proxy (ports 80, 443)

### 4. Run Database Migrations

```bash
docker-compose exec backend alembic upgrade head
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Nginx**: http://localhost (if configured)

## Local Development

### Backend Development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Setup database
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

## Production Deployment

### Using Docker Compose (Recommended)

1. **Update environment variables for production**

```bash
# backend/.env
ENVIRONMENT=production
SECRET_KEY=<generate-a-strong-secret-key>
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/pbi_db
REDIS_URL=redis://host:6379/0
OPENAI_API_KEY=<your-production-key>
STRIPE_SECRET_KEY=<your-production-stripe-key>
```

2. **Build and start services**

```bash
docker-compose -f docker-compose.yml build
docker-compose up -d
```

3. **Run migrations**

```bash
docker-compose exec backend alembic upgrade head
```

4. **Configure SSL/TLS**

Place your SSL certificates in `infra/nginx/ssl/`:
- `cert.pem` - SSL certificate
- `key.pem` - SSL private key

### Cloud Deployment Options

#### Railway

1. Connect your GitHub repository to Railway
2. Add environment variables
3. Railway will automatically detect the Dockerfile and deploy

#### AWS ECS/Fargate

1. Build and push Docker images to ECR
2. Create ECS task definition
3. Configure load balancer and target groups
4. Deploy using ECS service

#### Azure Container Apps

1. Build and push images to Azure Container Registry
2. Create Container App environment
3. Deploy using docker-compose configuration

## Database Management

### Backup Database

```bash
docker-compose exec postgres pg_dump -U postgres pbi_db > backup.sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U postgres pbi_db < backup.sql
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d
docker-compose exec backend alembic upgrade head
```

## Monitoring and Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Health Checks

```bash
# Backend health
curl http://localhost:8000/health

# Database health
docker-compose exec postgres pg_isready -U postgres

# Redis health
docker-compose exec redis redis-cli ping
```

## Troubleshooting

### Backend won't start

1. Check if database is ready:
```bash
docker-compose logs postgres
```

2. Check environment variables in backend/.env

3. Verify database connection string

### Frontend can't connect to backend

1. Check if backend is running: `curl http://localhost:8000/docs`

2. Verify VITE_API_URL in frontend/.env

3. Check CORS configuration in backend

### Database migration errors

```bash
# Reset migrations
docker-compose exec backend alembic downgrade base
docker-compose exec backend alembic upgrade head
```

## Performance Optimization

### Enable Redis Caching

Redis is already configured. Ensure it's running:

```bash
docker-compose ps redis
```

### Database Connection Pooling

Adjust in `backend/.env`:
```env
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10
```

### Static File Serving

Nginx is configured to serve static files. Ensure `frontend/build` is properly mounted.

## Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Use strong database passwords
- [ ] Enable SSL/TLS in production
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable firewall rules
- [ ] Regular database backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets

## Scaling

### Horizontal Scaling

To scale the backend:

```bash
docker-compose up -d --scale backend=3
```

### Load Balancing

Nginx is configured as a reverse proxy. For multiple backend instances, update the upstream configuration in `infra/nginx/nginx.conf`.

## Maintenance

### Update Dependencies

```bash
# Backend
cd backend
pip install --upgrade -r requirements.txt

# Frontend
cd frontend
npm update
```

### Regular Tasks

- Weekly database backups
- Monthly dependency updates
- Quarterly security audits
- Monitor disk space usage
- Review and rotate logs

## Support

For issues or questions:
- Email: team@pacemaker.edu
- Documentation: Check the README.md
- API Docs: http://localhost:8000/docs

## New Features Summary

This deployment includes:

1. **Extended Language Exam Support**
   - IELTS (Academic & General)
   - DELF (A1-C2)
   - DALF (C1-C2)
   - TCF Canada & Quebec
   - TEF Canada
   - Goethe-Zertifikat
   - TestDaF

2. **Inbox Messaging System**
   - Performance analysis messages
   - AI-generated insights
   - Achievement notifications
   - Dropout risk alerts

3. **Enhanced Learning Experience**
   - Video + documentation toggle
   - Lesson navigation
   - Progress tracking
   - Resource downloads

4. **Improved Live Sessions**
   - Session scheduling
   - Multiple session types
   - Recording support
   - Participant management

5. **Beginner Course Content**
   - German A1 level course
   - Kiswahili beginner course
   - Structured modules and lessons
   - Markdown documentation

6. **Modern UI/UX**
   - Updated landing page
   - Responsive design
   - Improved navigation
   - Better visual hierarchy
