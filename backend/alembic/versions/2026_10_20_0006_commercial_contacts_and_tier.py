"""commercial_contacts_and_tier

Revision ID: 2026_10_20_0006
Revises: 2026_10_20_0005
Create Date: 2026-10-20 16:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "2026_10_20_0006"
down_revision: Union[str, None] = "2026_10_20_0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add commercial and contact columns to kol_candidates
    op.add_column("kol_candidates", sa.Column("contact_line_id", sa.String(length=100), nullable=True))
    op.add_column("kol_candidates", sa.Column("contact_email", sa.String(length=255), nullable=True))
    op.add_column("kol_candidates", sa.Column("contact_phone", sa.String(length=50), nullable=True))
    op.add_column("kol_candidates", sa.Column("creator_tier", sa.String(length=50), server_default="Nano (1K-10K)", nullable=True))
    op.add_column("kol_candidates", sa.Column("rate_card_min", sa.Integer(), nullable=True))
    op.add_column("kol_candidates", sa.Column("rate_card_max", sa.Integer(), nullable=True))
    op.add_column("kol_candidates", sa.Column("last_posted_at", sa.DateTime(), nullable=True))
    op.add_column("kol_candidates", sa.Column("has_tiktok_shop", sa.Boolean(), server_default=sa.text("false"), nullable=False))
    op.add_column("kol_candidates", sa.Column("content_formats", sa.JSON(), server_default="[]", nullable=False))

    # 2. Add commercial and contact columns to kols table
    op.add_column("kols", sa.Column("contact_line_id", sa.String(length=100), nullable=True))
    op.add_column("kols", sa.Column("contact_email", sa.String(length=255), nullable=True))
    op.add_column("kols", sa.Column("contact_phone", sa.String(length=50), nullable=True))
    op.add_column("kols", sa.Column("creator_tier", sa.String(length=50), server_default="Nano (1K-10K)", nullable=True))
    op.add_column("kols", sa.Column("rate_card_min", sa.Integer(), nullable=True))
    op.add_column("kols", sa.Column("rate_card_max", sa.Integer(), nullable=True))
    op.add_column("kols", sa.Column("last_posted_at", sa.DateTime(), nullable=True))
    op.add_column("kols", sa.Column("has_tiktok_shop", sa.Boolean(), server_default=sa.text("false"), nullable=False))
    op.add_column("kols", sa.Column("content_formats", sa.JSON(), server_default="[]", nullable=False))


def downgrade() -> None:
    for col in [
        "content_formats", "has_tiktok_shop", "last_posted_at",
        "rate_card_max", "rate_card_min", "creator_tier",
        "contact_phone", "contact_email", "contact_line_id"
    ]:
        op.drop_column("kols", col)
        op.drop_column("kol_candidates", col)
