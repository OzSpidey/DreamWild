# DreamWild

> **Turn a two-line idea into a fully illustrated, narrated multi-chapter story, written live by Claude, one word at a time.**

DreamWild is an AI storytelling platform that generates complete multi-chapter stories with per-chapter scene illustrations and audio narration. Pick a genre, describe your protagonist and world, then watch Claude write each chapter in real time while fal.ai paints the scenes and OpenAI reads them aloud.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Claude](https://img.shields.io/badge/Claude-claude--sonnet--4--6-orange?logo=anthropic)](https://anthropic.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase)](https://supabase.com)
[![fal.ai](https://img.shields.io/badge/fal.ai-Flux%20Schnell-purple)](https://fal.ai)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

---

## Screenshots

### Landing Page
![Landing page, hero section with DreamWild logo, tagline "Where Stories Run Wild", and call-to-action buttons](./screenshots/landing.png)

*Dark parchment aesthetic with gold accents. Feature cards highlight multi-chapter stories, Claude prose, AI illustrations, and audio narration.*

---

### Story Forge Wizard
![6-step story creation wizard, genre selection grid showing Fantasy, Sci-Fi, Mystery, Romance, Horror, Adventure options](./screenshots/forge-genre.png)

*Step 1 of 6: genre picker. Progress bar at top tracks wizard position.*

![Forge wizard step 4, protagonist and setting text areas with gold focus rings](./screenshots/forge-characters.png)

*Step 4: protagonist and setting inputs. These seed Claude's story bible for the entire narrative.*

---

### Live Story Reading, Streaming
![Story reading page, left chapter nav sidebar, main content showing Chapter 1 complete with illustration and Chapter 2 actively streaming tokens](./screenshots/read-streaming.png)

*Chapters appear word-by-word as Claude streams. Each chapter has its own illustration (fal.ai Flux) and audio player (OpenAI TTS). The left sidebar shows chapter status with live indicators.*

---

### Story Library (Dashboard)
![Dashboard showing a grid of story cards, each with cover image, genre badge, chapter count, and Read button](./screenshots/dashboard.png)

*Every story saved permanently in Supabase. Cover image is the first chapter's illustration.*

---

## What It Does

You fill in a form. DreamWild does the rest:

1. **Outline**, Claude generates a chapter-by-chapter story outline with summaries and scene descriptions
2. **Write**, Each chapter is streamed token-by-token directly to your screen
3. **Illustrate**, fal.ai Flux Schnell generates a scene image per chapter in parallel
4. **Narrate**, OpenAI TTS renders each chapter as audio in the voice matched to your audience age
5. **Remember**, A living "story bible" is updated after each chapter so characters, world rules, and plot threads stay consistent
6. **Save**, Everything lives in your personal library, resumable any time

---

## Features

| Feature | Detail |
|---|---|
| **3–10 chapters** | User-controlled length, each 700–900 words |
| **Story bible continuity** | Claude reads a JSON continuity doc before writing each chapter, no character flip-flops |
| **5 genres** | Fantasy, Sci-Fi, Mystery, Romance, Horror, Adventure, Thriller, Fairy-Tale |
| **5 tones** | Whimsical, Dark, Epic, Humorous, Suspenseful, Romantic |
| **4 reading ages** | Children, Middle Grade, Young Adult, Adult (affects vocabulary, voice actor, complexity) |
| **5 image styles** | Illustrated, Realistic, Fantasy Art, Noir, Watercolor |
| **Real-time SSE** | Tokens stream directly from Claude → FastAPI → browser, no polling |
| **Parallel assets** | Image + audio generated concurrently while text streams |
| **Supabase Storage** | All images and audio stored permanently, not ephemeral URLs |
| **Full auth** | Supabase JWT, signup, login, your stories stay yours |

---

## Tech Stack

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│  Next.js 14 App Router · TypeScript · Tailwind CSS  │
│  Zustand state · SSE stream reader                  │
└────────────────────┬────────────────────────────────┘
                     │ HTTP + SSE
┌────────────────────▼────────────────────────────────┐
│                  FastAPI (Python)                    │
│  /api/v1/generate  →  SSE StreamingResponse         │
│  /api/v1/stories   →  CRUD                         │
│  /api/v1/auth      →  Supabase JWT proxy            │
└──────┬──────────────┬──────────────┬────────────────┘
       │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌───▼──────────────┐
│ Claude API  │ │  fal.ai    │ │   OpenAI TTS     │
│ (Anthropic) │ │ Flux/schnell│ │  tts-1 model    │
│ Streaming   │ │ 16:9 image │ │  per chapter    │
└─────────────┘ └─────────────┘ └──────────────────┘
                     │ assets stored
┌────────────────────▼────────────────────────────────┐
│              Supabase                               │
│  Postgres (stories, chapters, profiles)             │
│  Auth (JWT, RLS policies)                           │
│  Storage (chapter-images, chapter-audio buckets)    │
└─────────────────────────────────────────────────────┘
```

---

## Project Structure

```
dreamwild/
├── backend/                        # FastAPI (Python)
│   ├── app/
│   │   ├── main.py                 # App factory, CORS, routers
│   │   ├── config.py               # pydantic-settings env vars
│   │   ├── dependencies.py         # JWT auth + Supabase client dep
│   │   ├── models/
│   │   │   ├── story.py            # StoryCreateRequest, StoryOut, etc.
│   │   │   └── user.py             # SignupRequest, UserProfile
│   │   ├── routers/
│   │   │   ├── generate.py         # POST /generate → SSE stream
│   │   │   ├── stories.py          # GET/DELETE /stories
│   │   │   ├── auth.py             # signup / login
│   │   │   └── users.py            # profile CRUD
│   │   └── services/
│   │       ├── generation_pipeline.py   # ★ SSE orchestrator
│   │       ├── claude_service.py        # Outline + chapter streaming + bible update
│   │       ├── fal_service.py           # fal.ai image generation
│   │       ├── tts_service.py           # OpenAI TTS audio
│   │       └── storage_service.py       # Supabase Storage helpers
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                       # Next.js 14 (TypeScript)
│   └── src/
│       ├── app/
│       │   ├── page.tsx            # Landing page
│       │   ├── login/page.tsx      # Auth
│       │   ├── signup/page.tsx
│       │   ├── dashboard/page.tsx  # Story library
│       │   ├── forge/page.tsx      # 6-step creation wizard
│       │   └── stories/[storyId]/
│       │       └── read/page.tsx   # ★ Live reading + streaming
│       ├── components/
│       │   ├── story/
│       │   │   ├── ChapterReader.tsx     # Single complete chapter
│       │   │   ├── ChapterNav.tsx        # Sidebar chapter list
│       │   │   ├── GeneratingIndicator.tsx  # Live token cursor
│       │   │   ├── AudioPlayer.tsx       # Custom HTML5 player
│       │   │   └── StoryCard.tsx         # Library card
│       │   ├── ui/                  # Button, Input, Spinner
│       │   └── layout/Navbar.tsx
│       ├── hooks/
│       │   ├── useAuth.ts           # Supabase session
│       │   ├── useStories.ts        # Story list + delete
│       │   └── useStoryStream.ts    # Attaches SSE to Zustand store
│       ├── lib/
│       │   ├── api/stories.ts       # fetch wrappers
│       │   ├── api/sse.ts           # SSE stream parser
│       │   └── supabase/            # browser + server clients
│       ├── store/
│       │   ├── storyStore.ts        # Live stream state (Zustand)
│       │   └── uiStore.ts           # Forge wizard step
│       └── types/                   # story.ts, user.ts
│
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql   # Tables + RLS + triggers
│       └── 002_storage_policies.sql # Storage bucket policies
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker (optional, but easiest)
- Accounts: [Supabase](https://supabase.com), [Anthropic](https://console.anthropic.com), [fal.ai](https://fal.ai), [OpenAI](https://platform.openai.com)

---

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** and run both migration files:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_storage_policies.sql`
3. Go to **Storage** → create two **public** buckets:
   - `chapter-images`
   - `chapter-audio`
4. Collect your credentials from **Settings → API**:
   - Project URL
   - Anon key
   - Service role key
   - JWT secret

---

### 2. Environment Variables

```bash
cp .env.example .env
```

| Variable | Where |
|---|---|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `SUPABASE_JWT_SECRET` | Supabase → Settings → API → JWT Secret |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon/public key |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) → API Keys |
| `FAL_KEY` | [fal.ai/dashboard](https://fal.ai/dashboard) → Keys |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` for local dev |

---

### 3. Run with Docker Compose

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API docs (Swagger) | http://localhost:8000/docs |

---

### 4. Run without Docker

**Backend**

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Auth

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/signup` | Create account `{email, password, username}` |
| `POST` | `/auth/login` | Sign in → returns JWT `{email, password}` |
| `GET` | `/auth/me` | Current user (requires Bearer token) |

### Stories

| Method | Path | Description |
|---|---|---|
| `GET` | `/stories/` | List current user's stories |
| `GET` | `/stories/{id}` | Get story + all chapters |
| `DELETE` | `/stories/{id}` | Delete story + all storage assets |

### Generate

| Method | Path | Description |
|---|---|---|
| `POST` | `/generate/` | Start generation → returns `text/event-stream` |

**Generate request body:**

```json
{
  "genre": "fantasy",
  "tone": "epic",
  "reading_age": "adult",
  "protagonist": "A disgraced knight searching for redemption",
  "setting": "A dying empire where magic is seeping back into the world",
  "chapter_count": 5,
  "image_style": "fantasy-art"
}
```

**SSE event types emitted:**

```
event: status               data: {"message": "Crafting your outline…"}
event: story_started        data: {"story_id": "uuid", "title": "The Last Ember"}
event: chapter_started      data: {"chapter_number": 1, "title": "Ash and Steel"}
event: chapter_token        data: {"chapter_number": 1, "token": "The "}
event: chapter_text_complete data: {"chapter_number": 1}
event: chapter_image_ready  data: {"chapter_number": 1, "url": "https://…"}
event: chapter_audio_ready  data: {"chapter_number": 1, "url": "https://…"}
event: chapter_complete     data: {"chapter_number": 1}
event: story_complete       data: {"story_id": "uuid"}
event: error                data: {"message": "…"}
```

---

## How Story Generation Works

```
POST /api/v1/generate/
│
├── Insert story row (status: pending)
│
└── StreamingResponse (text/event-stream)
    │
    ├── Claude: generate JSON outline
    │     └── {title, chapters: [{number, title, summary, image_prompt}]}
    │
    ├── Update story.title + status: generating
    │
    └── For each chapter (sequential, to preserve continuity):
          │
          ├── Insert chapter row (status: generating)
          │
          ├── Claude stream_chapter()
          │     └── Yields tokens → SSE chapter_token events
          │
          ├── Persist full content to DB
          │
          ├── asyncio.gather(
          │     fal.ai generate_image()   → upload to Supabase Storage
          │     OpenAI TTS generate_audio() → upload to Supabase Storage
          │   )
          │
          ├── Update chapter row (content, image_url, audio_url, status: complete)
          │
          ├── Emit chapter_image_ready + chapter_audio_ready + chapter_complete
          │
          └── Claude update_story_bible()
                └── Reads finished chapter, updates JSON story bible
                    (protagonist state, world rules, open plot threads)
```

---

## Deployment

### Backend → Railway

1. Push to GitHub
2. New project on [Railway](https://railway.app) → Deploy from GitHub → root dir: `backend`
3. Add env vars (all except `NEXT_PUBLIC_*`)
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Copy your Railway service URL

### Frontend → Vercel

1. Import repo on [Vercel](https://vercel.com) → root dir: `frontend`
2. Add env vars including `NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app`
3. Deploy

Update `CORS_ORIGINS` in backend env vars to include your Vercel URL.

---

## License

MIT, see [LICENSE](LICENSE)

---

*Built with [Claude](https://anthropic.com), [fal.ai](https://fal.ai), [Supabase](https://supabase.com), [FastAPI](https://fastapi.tiangolo.com), and [Next.js](https://nextjs.org)*
