from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import CurrentUser
from app.models.account import Account
from app.models.activity import Activity
from app.models.follow_up import FollowUpSuggestion

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(current_user: CurrentUser, db: Annotated[Session, Depends(get_db)]):
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)

    # Accounts by status
    account_stats = (
        db.query(Account.status, func.count(Account.id))
        .group_by(Account.status)
        .all()
    )

    # Activities this week
    activities_this_week = (
        db.query(func.count(Activity.id))
        .filter(Activity.performed_at >= week_ago)
        .scalar()
    )

    # Pending follow-ups for current user
    pending_follow_ups = (
        db.query(func.count(FollowUpSuggestion.id))
        .filter(
            FollowUpSuggestion.assigned_to == current_user.id,
            FollowUpSuggestion.status == "pending",
        )
        .scalar()
    )

    # Total counts
    total_accounts = db.query(func.count(Account.id)).scalar()

    return {
        "total_accounts": total_accounts,
        "accounts_by_status": {status: count for status, count in account_stats},
        "activities_this_week": activities_this_week,
        "pending_follow_ups": pending_follow_ups,
    }
