from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, users, stories, generate

app = FastAPI(title="DreamWild API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,     prefix="/api/v1/auth",    tags=["auth"])
app.include_router(users.router,    prefix="/api/v1/users",   tags=["users"])
app.include_router(stories.router,  prefix="/api/v1/stories", tags=["stories"])
app.include_router(generate.router, prefix="/api/v1/generate", tags=["generate"])


@app.get("/health")
async def health():
    return {"status": "ok"}
