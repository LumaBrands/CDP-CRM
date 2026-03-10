import uuid
from datetime import datetime

from pydantic import BaseModel


class NoteCreate(BaseModel):
    body: str
    account_id: uuid.UUID | None = None
    contact_id: uuid.UUID | None = None


class NoteUpdate(BaseModel):
    body: str


class NoteRead(BaseModel):
    id: uuid.UUID
    body: str
    account_id: uuid.UUID | None
    contact_id: uuid.UUID | None
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
