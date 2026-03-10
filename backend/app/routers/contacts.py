from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import CurrentUser
from app.models.contact import Contact
from app.schemas.common import PaginatedResponse
from app.schemas.contact import ContactCreate, ContactRead, ContactUpdate

router = APIRouter()


@router.get("", response_model=PaginatedResponse[ContactRead])
def list_contacts(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    account_id: uuid.UUID | None = None,
    search: str | None = None,
):
    query = db.query(Contact)
    if account_id:
        query = query.filter(Contact.account_id == account_id)
    if search:
        query = query.filter(
            (Contact.first_name.ilike(f"%{search}%"))
            | (Contact.last_name.ilike(f"%{search}%"))
            | (Contact.email.ilike(f"%{search}%"))
        )

    total = query.count()
    items = query.order_by(Contact.created_at.desc()).offset(skip).limit(limit).all()
    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("", response_model=ContactRead, status_code=status.HTTP_201_CREATED)
def create_contact(data: ContactCreate, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    contact = Contact(**data.model_dump(), created_by=current_user.id)
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


@router.get("/{contact_id}", response_model=ContactRead)
def get_contact(contact_id: uuid.UUID, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact


@router.patch("/{contact_id}", response_model=ContactRead)
def update_contact(
    contact_id: uuid.UUID,
    data: ContactUpdate,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)
    db.commit()
    db.refresh(contact)
    return contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact(contact_id: uuid.UUID, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(contact)
    db.commit()
