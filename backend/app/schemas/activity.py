import uuid
from datetime import datetime

from pydantic import BaseModel


class ActivityCreate(BaseModel):
    type: str
    subject: str | None = None
    description: str | None = None
    account_id: uuid.UUID | None = None
    contact_id: uuid.UUID | None = None
    performed_by: uuid.UUID | None = None
    performed_at: datetime | None = None


class ActivityRead(BaseModel):
    id: uuid.UUID
    type: str
    subject: str | None
    description: str | None
    account_id: uuid.UUID | None
    contact_id: uuid.UUID | None
    performed_by: uuid.UUID
    performed_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}
