from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import CurrentUser
from app.models.account import Account
from app.models.activity import Activity
from app.models.contact import Contact
from app.models.note import Note
from app.schemas.account import AccountCreate, AccountDetail, AccountRead, AccountUpdate
from app.schemas.activity import ActivityRead
from app.schemas.common import PaginatedResponse
from app.schemas.contact import ContactRead
from app.schemas.note import NoteRead

router = APIRouter()


@router.get("", response_model=PaginatedResponse[AccountRead])
def list_accounts(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status_filter: str | None = Query(None, alias="status"),
    assigned_to: uuid.UUID | None = None,
    search: str | None = None,
):
    query = db.query(Account)
    if status_filter:
        query = query.filter(Account.status == status_filter)
    if assigned_to:
        query = query.filter(Account.assigned_to == assigned_to)
    if search:
        query = query.filter(Account.name.ilike(f"%{search}%"))

    total = query.count()
    items = query.order_by(Account.updated_at.desc()).offset(skip).limit(limit).all()
    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("", response_model=AccountRead, status_code=status.HTTP_201_CREATED)
def create_account(data: AccountCreate, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    account = Account(**data.model_dump(), created_by=current_user.id)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


@router.get("/{account_id}", response_model=AccountDetail)
def get_account(account_id: uuid.UUID, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    account = (
        db.query(Account)
        .options(joinedload(Account.assignee), joinedload(Account.contacts))
        .filter(Account.id == account_id)
        .first()
    )
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    recent_activities = (
        db.query(Activity)
        .filter(Activity.account_id == account_id)
        .order_by(Activity.performed_at.desc())
        .limit(20)
        .all()
    )
    notes = (
        db.query(Note)
        .filter(Note.account_id == account_id)
        .order_by(Note.created_at.desc())
        .all()
    )

    return AccountDetail(
        **AccountRead.model_validate(account).model_dump(),
        assignee=account.assignee,
        contacts=[ContactRead.model_validate(c) for c in account.contacts],
        recent_activities=[ActivityRead.model_validate(a) for a in recent_activities],
        notes=[NoteRead.model_validate(n) for n in notes],
    )


@router.patch("/{account_id}", response_model=AccountRead)
def update_account(
    account_id: uuid.UUID,
    data: AccountUpdate,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(account, field, value)
    db.commit()
    db.refresh(account)
    return account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(account_id: uuid.UUID, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete accounts")

    db.delete(account)
    db.commit()
