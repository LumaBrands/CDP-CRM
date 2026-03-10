from datetime import datetime, timezone
from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import CurrentUser
from app.models.follow_up import FollowUpSuggestion
from app.schemas.common import PaginatedResponse
from app.schemas.follow_up import FollowUpCreate, FollowUpRead, FollowUpUpdate

router = APIRouter()


@router.get("", response_model=PaginatedResponse[FollowUpRead])
def list_follow_ups(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    assigned_to: uuid.UUID | None = None,
    status_filter: str | None = Query(None, alias="status"),
):
    query = db.query(FollowUpSuggestion)
    if assigned_to:
        query = query.filter(FollowUpSuggestion.assigned_to == assigned_to)
    if status_filter:
        query = query.filter(FollowUpSuggestion.status == status_filter)

    total = query.count()
    items = query.order_by(FollowUpSuggestion.created_at.desc()).offset(skip).limit(limit).all()
    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("", response_model=FollowUpRead, status_code=status.HTTP_201_CREATED)
def create_follow_up(data: FollowUpCreate, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    follow_up = FollowUpSuggestion(**data.model_dump())
    db.add(follow_up)
    db.commit()
    db.refresh(follow_up)
    return follow_up


@router.get("/{follow_up_id}", response_model=FollowUpRead)
def get_follow_up(follow_up_id: uuid.UUID, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    follow_up = db.query(FollowUpSuggestion).filter(FollowUpSuggestion.id == follow_up_id).first()
    if not follow_up:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    return follow_up


@router.patch("/{follow_up_id}", response_model=FollowUpRead)
def update_follow_up(
    follow_up_id: uuid.UUID,
    data: FollowUpUpdate,
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
):
    follow_up = db.query(FollowUpSuggestion).filter(FollowUpSuggestion.id == follow_up_id).first()
    if not follow_up:
        raise HTTPException(status_code=404, detail="Follow-up not found")
    if data.status not in ("accepted", "dismissed"):
        raise HTTPException(status_code=400, detail="Status must be 'accepted' or 'dismissed'")

    follow_up.status = data.status
    follow_up.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(follow_up)
    return follow_up
