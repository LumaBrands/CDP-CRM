import uuid
from datetime import datetime

from pydantic import BaseModel

from app.schemas.user import UserRead


class AccountCreate(BaseModel):
    name: str
    domain: str | None = None
    industry: str | None = None
    status: str = "prospect"
    assigned_to: uuid.UUID | None = None


class AccountUpdate(BaseModel):
    name: str | None = None
    domain: str | None = None
    industry: str | None = None
    status: str | None = None
    assigned_to: uuid.UUID | None = None


class AccountRead(BaseModel):
    id: uuid.UUID
    name: str
    domain: str | None
    industry: str | None
    status: str
    assigned_to: uuid.UUID | None
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AccountDetail(AccountRead):
    assignee: UserRead | None = None
    contacts: list = []
    recent_activities: list = []
    notes: list = []
