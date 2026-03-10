from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import CurrentUser
from app.models.note import Note
from app.schemas.common import PaginatedResponse
from app.schemas.note import NoteCreate, NoteRead, NoteUpdate

router = APIRouter()


@router.get("", response_model=PaginatedResponse[NoteRead])
def list_notes(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    account_id: uuid.UUID | None = None,
    contact_id: uuid.UUID | None = None,
):
    query = db.query(Note)
    if account_id:
        query = query.filter(Note.account_id == account_id)
    if contact_id:
        query = query.filter(Note.contact_id == contact_id)

    total = query.count()
    items = query.order_by(Note.created_at.desc()).offset(skip).limit(limit).all()
    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("", response_model=NoteRead, status_code=status.HTTP_201_CREATED)
def create_note(data: NoteCreate, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    if not data.account_id and not data.contact_id:
        raise HTTPException(status_code=400, detail="Must provide account_id or contact_id")

    note = Note(**data.model_dump(), created_by=current_user.id)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.patch("/{note_id}", response_model=NoteRead)
def update_note(
    note_id: uuid.UUID,
    data: NoteUpdate,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Can only edit your own notes")

    note.body = data.body
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: uuid.UUID, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Can only delete your own notes")

    db.delete(note)
    db.commit()
