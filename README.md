# Pacemaker Business Institute (PBI)

## AI-Powered Learning Management System for Language & Tech Education

PBI is a comprehensive, AI-driven educational platform specializing in Language Learning (English, French, German, Kiswahili) and exam preparation. The platform features specialized preparation for official certification exams including TOEFL, IELTS, Duolingo, DELF, DALF, TCF (Canada & Quebec), TEF Canada, Goethe, and TestDaF.

## 🎯 Key Features

### Comprehensive Language Exam Preparation
- **English**: TOEFL iBT, IELTS Academic & General, Duolingo English Test
- **French**: DELF (A1-C2), DALF (C1-C2), TCF Canada, TCF Quebec, TEF Canada
- **German**: Goethe-Zertifikat, TestDaF, DSH
- **Kiswahili**: Beginner to advanced courses

### Core Learning Features
- **AI-Powered Tutor**: 24/7 AI assistance trained on official exam standards
- **Video Courses & Documentation**: Comprehensive lessons with video and written content
- **Live Classes**: Expert-led sessions 3x per week (speaking practice, workshops, Q&A)
- **Realistic Exam Simulation**: Mock tests mimicking actual exam environments
- **Performance Tracking**: Detailed analytics with AI-powered insights

### AI Capabilities
- **Automated Performance Analysis**: Weekly AI-generated performance reports sent to inbox
- **Intelligent Scoring**: Real-time metrics (Engagement, Mastery, Momentum, Confidence, Dropout Risk)
- **Adaptive Learning**: Personalized recommendations based on progress
- **AI-Graded Assessments**: Automated evaluation of writing and speaking responses

### Student Engagement
- **Inbox Messaging**: Performance analysis, achievements, and reminders
- **Leaderboards**: Global ranking based on performance
- **Gamification**: Points, streaks, achievements, and rewards
- **Progress Tracking**: Detailed course and exam progress visualization

---

## 🚀 Features

### Core Features
- **AI-Powered Learning Engine**: Intelligent tutoring system with personalized feedback
- **Exam Simulation**: Realistic mock tests mimicking official exam interfaces (TOEFL, Duolingo, TCF)
- **AI-Graded Assessments**: Automated evaluation of writing and speaking responses
- **Gamification**: Points, streaks, leaderboards, and achievement badges
- **Live Sessions**: Real-time video conferencing for live classes and speaking practice

### AI Capabilities
- **AI Tutor Chatbot**: Context-aware conversational AI for instant help
- **Automated Rubric Grading**: AI evaluates responses against official exam standards
- **Intelligence Scoring**: Real-time metrics (Engagement, Mastery, Momentum, Confidence, Dropout Risk)
- **Adaptive Quizzes**: Dynamically generated questions based on student weaknesses

### Exam Preparation
- **Duolingo English Test Simulation**: Adaptive practice environment
- **TOEFL iBT Preparation**: Full-length timed practice tests
- **TCF (French) Certification**: Quebec & Canada exam prep
- **Real-time Timer**: WebSocket-based countdown with auto-submit

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Python 3.11+, FastAPI, SQLAlchemy |
| **Database** | PostgreSQL (primary), Redis (cache/sessions) |
| **AI/ML** | OpenAI GPT / Abacus AI integration |
| **Deployment** | Docker, Docker Compose |

### Project Structure

```
PBI/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/v1/        # API endpoints
│   │   │   ├── endpoints/ # Core API routes
│   │   │   └── ai/        # AI service routes
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   │   └── ai/        # AI services
│   │   ├── core/          # Security, config
│   │   └── db/            # Database config
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/          # Page components
│   │   ├── stores/         # Zustand stores
│   │   └── services/       # API clients
│   ├── Dockerfile
│   └── package.json
├── infra/                  # Infrastructure configs
│   ├── nginx/
│   ├── postgres/
│   └── redis/
└── docker-compose.yml
```

---

## 🚀 Quick Start

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Prerequisites
- Docker & Docker Compose
- Python 3.11+ (for local development)
- Node.js 20+ (for local development)

### Docker Deployment (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourorg/pbi.git
cd pbi

# Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Local Development

#### Backend
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

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 API Documentation

Once the backend is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/v1/auth/register` | User registration |
| `POST /api/v1/auth/login` | User login |
| `GET /api/v1/courses/` | List courses |
| `POST /api/v1/exams/{id}/start` | Start mock exam |
| `POST /api/v1/ai/tutor/chat` | AI tutor chat |
| `POST /api/v1/ai/evaluator/grade` | Grade writing/speaking |
| `GET /api/v1/ai/analytics/me` | Get AI analytics |
| `GET /api/v1/gamification/leaderboard` | Leaderboard |

---

## 🤖 AI Configuration

### OpenAI Integration
Set your OpenAI API key in `backend/.env`:
```env
OPENAI_API_KEY=sk-your-key-here
```

### Abacus AI Integration (Optional)
```env
ABACUS_AI_API_KEY=your-abacus-key
ABACUS_AI_BASE_URL=https://api.abacus.ai
```

The AI evaluator uses exam-specific prompts for:
- **TOEFL iBT**: Speaking (Delivery, Language Use, Topic Development), Writing (Development, Organization, Language)
- **Duolingo**: Grammatical Complexity, Lexical Sophistication, Semantic Coherence
- **TCF**: Fluency, Accuracy, Interaction, Coherence

---

## 🎯 Exam Simulation Features

### Supported Exams
1. **Duolingo English Test** - Adaptive 60-minute test
2. **TOEFL iBT** - 4 sections: Reading, Listening, Speaking, Writing
3. **IELTS** - Academic & General Training
4. **TCF (French) Certification** - Quebec & Canada exam prep
5. **DELF/DALF** - French language certification (A1-C2)
6. **TEF Canada** - French proficiency for Canadian immigration
7. **Goethe-Zertifikat** - German language certification
8. **TestDaF** - German for university admissionrtification

### Exam Interface
- Real-time countdown timer via WebSocket
- Section navigation
- Question flagging
- Auto-submit on time expiration
- Detailed score breakdown with AI feedback

---

## 🎮 Gamification System

### Features
- **Points**: Earn points for activities (videos, quizzes, exams)
- **Streaks**: Daily login tracking with bonuses
- **Leaderboards**: Global and friends rankings
- **Achievements**: Milestone-based badges
- **Rewards Store**: Redeem points for discounts/premium tokens

### Activity Points
| Activity | Points |
|----------|--------|
| Video (per minute) | 2 |
| Quiz Completed | 20 |
| Exam Completed | 100 |
| Daily Login | 5 |
| Streak Maintained | 15 |

---

## 📊 Database Schema

The platform uses a relational database with the following main entities:

- **Users** - Students, Instructors, Admins
- **Courses** - Course catalog with modules and lessons
- **Mock Exams** - Exam definitions and attempts
- **AI Analytics** - Intelligence scoring data
- **Gamification** - Points, streaks, achievements
- **Subscriptions** - Payment and billing
- **Live Sessions** - Scheduled video sessions

See the Mermaid diagram in `BLUEPRINT.md` for the complete schema.

---

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/pbi_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-super-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 📦 Deployment

### Production Deployment

1. **Build Docker images**:
```bash
docker-compose -f docker-compose.yml build
```

2. **Start production services**:
```bash
docker-compose up -d
```

3. **Run migrations**:
```bash
docker-compose exec backend alembic upgrade head
```

### Cloud Deployment
- **Railway**: Connect GitHub repo, set environment variables
- **AWS ECS**: Use provided Dockerfiles with ECS/Fargate
- **Azure Container Apps**: Deploy with docker-compose

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For support, email team@pacemaker.edu or join our Slack channel.

---

## 🙏 Acknowledgments

- FastAPI team for the amazing framework
- React team for the frontend library
- OpenAI for AI capabilities
- The open-source community
