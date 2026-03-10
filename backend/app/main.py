from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, users, accounts, contacts, activities, notes, follow_ups, dashboard

app = FastAPI(title="CDP CRM API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(accounts.router, prefix="/api/accounts", tags=["accounts"])
app.include_router(contacts.router, prefix="/api/contacts", tags=["contacts"])
app.include_router(activities.router, prefix="/api/activities", tags=["activities"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(follow_ups.router, prefix="/api/follow-ups", tags=["follow-ups"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
