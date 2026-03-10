from typing import Annotated
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import CurrentUser
from app.models.activity import Activity
from app.schemas.activity import ActivityCreate, ActivityRead
from app.schemas.common import PaginatedResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[ActivityRead])
def list_activities(
    current_user: CurrentUser,
    db: Annotated[Session, Depends(get_db)],
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    account_id: uuid.UUID | None = None,
    contact_id: uuid.UUID | None = None,
    performed_by: uuid.UUID | None = None,
    type_filter: str | None = Query(None, alias="type"),
):
    query = db.query(Activity)
    if account_id:
        query = query.filter(Activity.account_id == account_id)
    if contact_id:
        query = query.filter(Activity.contact_id == contact_id)
    if performed_by:
        query = query.filter(Activity.performed_by == performed_by)
    if type_filter:
        query = query.filter(Activity.type == type_filter)

    total = query.count()
    items = query.order_by(Activity.performed_at.desc()).offset(skip).limit(limit).all()
    return PaginatedResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("", response_model=ActivityRead, status_code=status.HTTP_201_CREATED)
def create_activity(data: ActivityCreate, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    activity_data = data.model_dump(exclude_unset=True)
    if "performed_by" not in activity_data or activity_data["performed_by"] is None:
        activity_data["performed_by"] = current_user.id

    activity = Activity(**activity_data)
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.get("/{activity_id}", response_model=ActivityRead)
def get_activity(activity_id: uuid.UUID, current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return activity
