"""creator_media_urls

Revision ID: 2026_10_20_0005
Revises: 2026_09_27_0004
Create Date: 2026-10-20 15:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "2026_10_20_0005"
down_revision: Union[str, None] = "2026_09_27_0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add avatar_url and video_thumbnail_url to kol_candidates
    op.add_column(
        "kol_candidates",
        sa.Column("avatar_url", sa.String(length=1024), nullable=True),
    )
    op.add_column(
        "kol_candidates",
        sa.Column("video_thumbnail_url", sa.String(length=1024), nullable=True),
    )

    # 2. Add avatar_url and video_thumbnail_url to legacy kols table
    op.add_column(
        "kols",
        sa.Column("avatar_url", sa.String(length=1024), nullable=True),
    )
    op.add_column(
        "kols",
        sa.Column("video_thumbnail_url", sa.String(length=1024), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("kols", "video_thumbnail_url")
    op.drop_column("kols", "avatar_url")
    op.drop_column("kol_candidates", "video_thumbnail_url")
    op.drop_column("kol_candidates", "avatar_url")
