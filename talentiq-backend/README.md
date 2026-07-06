# TalentIQ Backend

> **AI-Powered Recruitment Intelligence Platform** — Production-ready FastAPI backend

[![Python](https://img.shields.io/badge/Python-3.12+-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2-orange)](https://langchain-ai.github.io/langgraph)

---

## Architecture

```
talentiq-backend/
├── app/
│   ├── main.py              ← FastAPI app, CORS, exception handlers
│   ├── config/settings.py   ← Environment configuration
│   ├── database/            ← SQLAlchemy Base, session, init
│   ├── models/              ← User, Job, Candidate, Analysis, Settings
│   ├── schemas/             ← Pydantic v2 request/response schemas
│   ├── api/                 ← FastAPI routers (auth, jobs, upload, candidates, analytics, settings)
│   ├── agents/              ← LangGraph pipeline + 6 AI agents
│   │   ├── orchestrator.py  ← LangGraph StateGraph pipeline
│   │   ├── resume_agent.py  ← Gemini resume extraction
│   │   ├── matching_agent.py← JD vs resume scoring
│   │   ├── github_agent.py  ← GitHub REST API analysis
│   │   ├── linkedin_agent.py← LinkedIn profile scoring
│   │   ├── recommendation_agent.py ← Final verdict
│   │   └── interview_agent.py ← Interview question generation
│   ├── services/            ← LLM, PDF/DOCX parsers, GitHub, scoring, auth
│   └── utils/               ← Logging, file utils, JWT dependency
├── tests/                   ← pytest test suite
├── uploads/                 ← Resume storage
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

## AI Pipeline

```
POST /api/upload
    ↓
Resume Agent (Gemini)    → name, email, skills, experience, education, projects
    ↓
Matching Agent (Gemini)  → match_score, matched_skills, missing_skills
    ↓
GitHub Agent             → activity_score, repos, stars, languages (optional)
    ↓
LinkedIn Agent (Gemini)  → linkedin_score, profile completeness (optional)
    ↓
Recommendation Agent     → overall_score (0-100), recommendation (Strong Hire/Hire/Consider/Reject)
    ↓
Interview Agent          → technical, behavioral, follow-up, red-flag questions
    ↓
Store to PostgreSQL
    ↓
Return structured JSON
```

---

## Setup

### Prerequisites

- Python 3.12+
- PostgreSQL 14+
- Google Gemini API key ([get one free](https://aistudio.google.com/app/apikey))

### 1. Install dependencies

```bash
cd talentiq-backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Start PostgreSQL

```bash
# Docker (easiest)
docker run -d \
  --name talentiq-db \
  -e POSTGRES_DB=talentiq \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

### 4. Run the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API creates tables automatically on startup. Visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health**: http://localhost:8000/health

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql+psycopg2://postgres:postgres@localhost:5432/talentiq` | PostgreSQL connection string |
| `SECRET_KEY` | *(required)* | JWT signing secret — use a long random string |
| `GEMINI_API_KEY` | *(required)* | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-1.5-flash` | Gemini model to use |
| `GITHUB_TOKEN` | *(optional)* | GitHub PAT for higher rate limits |
| `ALLOWED_ORIGINS` | `["http://localhost:3000"]` | Frontend URLs for CORS |
| `UPLOAD_DIR` | `uploads` | Local directory for resume storage |
| `MAX_UPLOAD_SIZE_MB` | `10` | Max file upload size |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | JWT refresh token lifetime |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create recruiter account |
| POST | `/api/auth/login` | Login, get JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/jobs` | List all jobs |
| POST | `/api/jobs` | Create job |
| GET | `/api/jobs/{id}` | Get job details |
| PUT | `/api/jobs/{id}` | Update job |
| DELETE | `/api/jobs/{id}` | Delete job |

### Candidates
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload` | Upload resume → trigger AI pipeline |
| GET | `/api/candidates` | List candidates (filterable by job_id) |
| GET | `/api/candidates/{id}` | Full candidate profile + analysis |
| DELETE | `/api/candidates/{id}` | Remove candidate |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/summary` | Dashboard stats + all analytics |

### Settings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/settings` | Get user settings |
| PUT | `/api/settings` | Update user settings |

---

## Docker

### One-command startup

```bash
# Copy and fill in your .env
cp .env.example .env
# Edit GEMINI_API_KEY in .env

docker-compose up --build -d
```

This starts:
- **PostgreSQL** on port 5432
- **TalentIQ API** on port 8000

---

## Testing

```bash
# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_auth.py -v

# Run with coverage
pytest tests/ --cov=app --cov-report=html
```

---

## Database Migrations (Alembic)

```bash
# Initialize (already done)
alembic init alembic

# Generate migration after model changes
alembic revision --autogenerate -m "describe your change"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## Frontend Integration

The Next.js frontend connects to the backend via `src/lib/api.ts`:

- Auth: `AuthModal.tsx` calls `/api/auth/login` and `/api/auth/register`
- Jobs: `jobs/new/page.tsx` calls `/api/jobs` on Create Job
- Upload: `upload/page.tsx` calls `/api/upload` with `multipart/form-data`
- JWT tokens stored in `localStorage` as `talentiq:token`

Set `NEXT_PUBLIC_API_URL=http://localhost:8000` in the frontend `.env.local`.

---

## Future Roadmap

- [ ] Email verification on registration
- [ ] Webhook notifications for completed analysis
- [ ] Bulk resume upload (ZIP files)
- [ ] Export candidate reports as PDF
- [ ] Advanced semantic search across candidates
- [ ] Team/multi-recruiter support
- [ ] Candidate scoring history and trends
- [ ] Integration with ATS systems (Greenhouse, Lever)
- [ ] Video interview question generation
- [ ] Bias detection in scoring
