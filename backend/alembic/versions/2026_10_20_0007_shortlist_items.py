"""shortlist_items

Revision ID: 2026_10_20_0007
Revises: 2026_10_20_0006
Create Date: 2026-10-20 22:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "2026_10_20_0007"
down_revision: Union[str, None] = "2026_10_20_0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "kol_shortlist_items",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("campaign_id", sa.String(length=100), nullable=False, server_default="default"),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="shortlisted"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("added_at", sa.DateTime(), nullable=True),
        sa.Column("draft_due_date", sa.String(length=50), nullable=True),
        sa.Column("live_date", sa.String(length=50), nullable=True),
        sa.Column("agreed_rate_thb", sa.Float(), nullable=True),
        sa.Column("deliverable_format", sa.String(length=100), nullable=True),
        sa.Column("document_links", sa.JSON(), server_default="[]", nullable=False),
        sa.Column("live_post_url", sa.String(length=512), nullable=True),
        sa.Column("actual_cost_thb", sa.Float(), nullable=True),
        sa.Column("actual_views", sa.Integer(), nullable=True),
        sa.Column("actual_likes", sa.Integer(), nullable=True),
        sa.Column("actual_comments", sa.Integer(), nullable=True),
        sa.Column("actual_shares", sa.Integer(), nullable=True),
        sa.Column("tracking_status", sa.String(length=50), server_default="pending_post", nullable=True),
        sa.Column("tracking_updated_at", sa.DateTime(), nullable=True),
        sa.Column("creator_snapshot", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_kol_shortlist_items_campaign_id", "kol_shortlist_items", ["campaign_id"])
    op.create_index("ix_kol_shortlist_items_username", "kol_shortlist_items", ["username"])


def downgrade() -> None:
    op.drop_index("ix_kol_shortlist_items_username", table_name="kol_shortlist_items")
    op.drop_index("ix_kol_shortlist_items_campaign_id", table_name="kol_shortlist_items")
    op.drop_table("kol_shortlist_items")
