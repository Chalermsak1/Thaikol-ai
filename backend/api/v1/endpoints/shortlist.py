import uuid
from datetime import datetime, timezone
from typing import Generator, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from core.database import SessionLocal, check_db_connection
from core.logging import logger
from models.shortlist import KOLShortlistItemModel
from schemas.shortlist import (
    ShortlistItemSchema,
    ShortlistUpdateRequest,
    ShortlistSyncRequest,
    ShortlistSyncResponse,
)

router = APIRouter()


def get_optional_db() -> Generator[Optional[Session], None, None]:
    if SessionLocal is None or not check_db_connection():
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _model_to_schema(m: KOLShortlistItemModel) -> ShortlistItemSchema:
    return ShortlistItemSchema(
        username=m.username,
        campaign_id=m.campaign_id,
        status=m.status,
        notes=m.notes or "",
        added_at=m.added_at.isoformat() if m.added_at else None,
        draft_due_date=m.draft_due_date,
        live_date=m.live_date,
        agreed_rate_thb=m.agreed_rate_thb,
        deliverable_format=m.deliverable_format,
        document_links=m.document_links or [],
        live_post_url=m.live_post_url,
        actual_cost_thb=m.actual_cost_thb,
        actual_views=m.actual_views,
        actual_likes=m.actual_likes,
        actual_comments=m.actual_comments,
        actual_shares=m.actual_shares,
        tracking_status=m.tracking_status,
        tracking_updated_at=m.tracking_updated_at.isoformat() if m.tracking_updated_at else None,
        creator=m.creator_snapshot,
    )


@router.get(
    "",
    response_model=List[ShortlistItemSchema],
    summary="List Persisted Shortlist Items",
    description="Retrieves shortlisted creator collaboration workflows, optionally filtered by campaign.",
)
def list_shortlist_items(
    campaign_id: Optional[str] = Query(None, description="Optional Campaign ID filter"),
    db: Optional[Session] = Depends(get_optional_db),
) -> List[ShortlistItemSchema]:
    if db is None:
        return []

    query = db.query(KOLShortlistItemModel)
    if campaign_id and campaign_id != "all":
        query = query.filter(KOLShortlistItemModel.campaign_id == campaign_id)

    records = query.order_by(KOLShortlistItemModel.updated_at.desc()).all()
    return [_model_to_schema(r) for r in records]


@router.post(
    "",
    response_model=ShortlistItemSchema,
    status_code=status.HTTP_200_OK,
    summary="Save or Upsert Shortlist Item",
    description="Persists or updates a creator in the shortlist campaign workflow with full snapshot.",
)
def upsert_shortlist_item(
    payload: ShortlistItemSchema,
    db: Optional[Session] = Depends(get_optional_db),
) -> ShortlistItemSchema:
    if db is None:
        return payload

    clean_user = payload.username.strip().lstrip("@").lower()
    camp_id = payload.campaign_id or "default"

    existing = (
        db.query(KOLShortlistItemModel)
        .filter(
            KOLShortlistItemModel.username == clean_user,
            KOLShortlistItemModel.campaign_id == camp_id,
        )
        .first()
    )

    if existing:
        existing.status = payload.status
        existing.notes = payload.notes
        existing.draft_due_date = payload.draft_due_date
        existing.live_date = payload.live_date
        existing.agreed_rate_thb = payload.agreed_rate_thb
        existing.deliverable_format = payload.deliverable_format
        existing.document_links = payload.document_links
        existing.live_post_url = payload.live_post_url
        existing.actual_cost_thb = payload.actual_cost_thb
        existing.actual_views = payload.actual_views
        existing.actual_likes = payload.actual_likes
        existing.actual_comments = payload.actual_comments
        existing.actual_shares = payload.actual_shares
        existing.tracking_status = payload.tracking_status or "pending_post"
        if payload.creator is not None:
            existing.creator_snapshot = payload.creator
        existing.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(existing)
        return _model_to_schema(existing)
    else:
        new_item = KOLShortlistItemModel(
            id=str(uuid.uuid4()),
            campaign_id=camp_id,
            username=clean_user,
            status=payload.status,
            notes=payload.notes,
            added_at=datetime.now(timezone.utc),
            draft_due_date=payload.draft_due_date,
            live_date=payload.live_date,
            agreed_rate_thb=payload.agreed_rate_thb,
            deliverable_format=payload.deliverable_format,
            document_links=payload.document_links,
            live_post_url=payload.live_post_url,
            actual_cost_thb=payload.actual_cost_thb,
            actual_views=payload.actual_views,
            actual_likes=payload.actual_likes,
            actual_comments=payload.actual_comments,
            actual_shares=payload.actual_shares,
            tracking_status=payload.tracking_status or "pending_post",
            creator_snapshot=payload.creator,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc),
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return _model_to_schema(new_item)


@router.put(
    "/{username}",
    response_model=ShortlistItemSchema,
    summary="Partially Update Shortlist Item",
    description="Updates status, notes, rates, dates, or live tracking data for a shortlisted creator.",
)
def update_shortlist_item(
    username: str,
    payload: ShortlistUpdateRequest,
    campaign_id: str = Query("default", description="Associated Campaign ID"),
    db: Optional[Session] = Depends(get_optional_db),
) -> ShortlistItemSchema:
    clean_user = username.strip().lstrip("@").lower()
    if db is None:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database storage is unavailable")

    existing = (
        db.query(KOLShortlistItemModel)
        .filter(
            KOLShortlistItemModel.username == clean_user,
            KOLShortlistItemModel.campaign_id == campaign_id,
        )
        .first()
    )

    if not existing:
        # Fallback to any campaign matching username if default not found
        existing = db.query(KOLShortlistItemModel).filter(KOLShortlistItemModel.username == clean_user).first()

    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shortlist item for '@{clean_user}' not found in campaign '{campaign_id}'",
        )

    for field, val in payload.model_dump(exclude_unset=True).items():
        if field == "creator":
            existing.creator_snapshot = val
        elif hasattr(existing, field):
            setattr(existing, field, val)

    existing.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(existing)
    return _model_to_schema(existing)


@router.delete(
    "/{username}",
    summary="Remove Creator from Shortlist",
    description="Deletes a shortlisted creator item from PostgreSQL database.",
)
def remove_shortlist_item(
    username: str,
    campaign_id: Optional[str] = Query(None, description="Optional Campaign ID"),
    db: Optional[Session] = Depends(get_optional_db),
):
    clean_user = username.strip().lstrip("@").lower()
    if db is None:
        return {"status": "deleted", "username": clean_user}

    query = db.query(KOLShortlistItemModel).filter(KOLShortlistItemModel.username == clean_user)
    if campaign_id and campaign_id != "all":
        query = query.filter(KOLShortlistItemModel.campaign_id == campaign_id)

    deleted_count = query.delete(synchronize_session=False)
    db.commit()
    return {"status": "deleted", "username": clean_user, "deleted_count": deleted_count}


@router.post(
    "/sync",
    response_model=ShortlistSyncResponse,
    summary="Batch Synchronize Shortlist Items",
    description="Syncs an array of shortlist items between frontend and PostgreSQL database.",
)
def sync_shortlist_items(
    payload: ShortlistSyncRequest,
    db: Optional[Session] = Depends(get_optional_db),
) -> ShortlistSyncResponse:
    if db is None or not payload.items:
        return ShortlistSyncResponse(status="skipped_no_db", synced_count=len(payload.items), items=payload.items)

    synced_items: List[ShortlistItemSchema] = []
    for it in payload.items:
        try:
            res = upsert_shortlist_item(it, db=db)
            synced_items.append(res)
        except Exception as e:
            logger.warning("Error syncing shortlist item @%s: %s", it.username, e)

    return ShortlistSyncResponse(
        status="success",
        synced_count=len(synced_items),
        items=synced_items,
    )
