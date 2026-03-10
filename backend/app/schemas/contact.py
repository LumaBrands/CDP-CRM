import uuid
from datetime import datetime

from pydantic import BaseModel


class ContactCreate(BaseModel):
    account_id: uuid.UUID
    first_name: str
    last_name: str
    email: str | None = None
    phone: str | None = None
    job_title: str | None = None
    is_primary: bool = False


class ContactUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    phone: str | None = None
    job_title: str | None = None
    is_primary: bool | None = None


class ContactRead(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    first_name: str
    last_name: str
    email: str | None
    phone: str | None
    job_title: str | None
    is_primary: bool
    created_by: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
