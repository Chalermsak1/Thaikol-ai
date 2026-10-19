"""phase5_kol_snapshots_and_profile_status

Revision ID: 2026_09_27_0004
Revises: 2026_09_17_0003
Create Date: 2026-09-27 00:33:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "2026_09_27_0004"
down_revision: Union[str, None] = "2026_09_17_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Update kol_candidates table to support verified profile state and optional URL
    op.add_column(
        "kol_candidates",
        sa.Column("is_profile_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False),
    )
    op.add_column(
        "kol_candidates",
        sa.Column("profile_status", sa.String(length=50), server_default="unavailable", nullable=False),
    )
    op.alter_column(
        "kol_candidates",
        "profile_url",
        existing_type=sa.String(length=512),
        nullable=True,
    )

    # 2. Create kol_candidate_snapshots table
    op.create_table(
        "kol_candidate_snapshots",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column(
            "kol_candidate_id",
            sa.String(length=36),
            sa.ForeignKey("kol_candidates.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("follower_count", sa.Integer(), nullable=True),
        sa.Column("sample_video_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("total_views", sa.Integer(), nullable=True),
        sa.Column("total_likes", sa.Integer(), nullable=True),
        sa.Column("total_comments", sa.Integer(), nullable=True),
        sa.Column("total_shares", sa.Integer(), nullable=True),
        sa.Column("total_saves", sa.Integer(), nullable=True),
        sa.Column("average_views", sa.Float(), nullable=True),
        sa.Column("average_likes", sa.Float(), nullable=True),
        sa.Column("average_comments", sa.Float(), nullable=True),
        sa.Column("average_shares", sa.Float(), nullable=True),
        sa.Column("average_saves", sa.Float(), nullable=True),
        sa.Column("estimated_engagement_rate", sa.Float(), nullable=True),
        sa.Column("collected_at", sa.DateTime(), nullable=False),
    )
    op.create_index(
        "ix_kol_candidate_snapshots_kol_candidate_id",
        "kol_candidate_snapshots",
        ["kol_candidate_id"],
    )
    op.create_index(
        "ix_kol_candidate_snapshots_collected_at",
        "kol_candidate_snapshots",
        ["collected_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_kol_candidate_snapshots_collected_at", table_name="kol_candidate_snapshots")
    op.drop_index("ix_kol_candidate_snapshots_kol_candidate_id", table_name="kol_candidate_snapshots")
    op.drop_table("kol_candidate_snapshots")
    op.alter_column(
        "kol_candidates",
        "profile_url",
        existing_type=sa.String(length=512),
        nullable=False,
    )
    op.drop_column("kol_candidates", "profile_status")
    op.drop_column("kol_candidates", "is_profile_verified")
