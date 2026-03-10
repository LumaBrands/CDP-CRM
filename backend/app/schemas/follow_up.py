import uuid
from datetime import datetime

from pydantic import BaseModel


class FollowUpCreate(BaseModel):
    account_id: uuid.UUID | None = None
    contact_id: uuid.UUID | None = None
    assigned_to: uuid.UUID
    suggestion_type: str = "email"
    subject: str | None = None
    body: str
    source: str = "ai_agent"


class FollowUpUpdate(BaseModel):
    status: str  # accepted, dismissed


class FollowUpRead(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID | None
    contact_id: uuid.UUID | None
    assigned_to: uuid.UUID
    suggestion_type: str
    subject: str | None
    body: str
    status: str
    source: str
    created_at: datetime
    reviewed_at: datetime | None

    model_config = {"from_attributes": True}
