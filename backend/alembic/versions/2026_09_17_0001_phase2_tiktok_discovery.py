"""phase2_tiktok_discovery

Revision ID: 2026_09_17_0001
Revises: 
Create Date: 2026-09-17 21:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "2026_09_17_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create kol_candidates table
    op.create_table(
        "kol_candidates",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("normalized_username", sa.String(length=100), nullable=False),
        sa.Column("display_name", sa.String(length=255), nullable=False),
        sa.Column("profile_url", sa.String(length=512), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
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
        sa.Column("hashtags", sa.JSON(), server_default="[]", nullable=False),
        sa.Column("sample_captions", sa.JSON(), server_default="[]", nullable=False),
        sa.Column("matched_queries", sa.JSON(), server_default="[]", nullable=False),
        sa.Column("thai_language_ratio", sa.Float(), server_default="0.0", nullable=False),
        sa.Column("thailand_keyword_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("thailand_hashtag_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("location_mentions", sa.JSON(), server_default="[]", nullable=False),
        sa.Column("local_signal_score", sa.Float(), server_default="0.0", nullable=False),
        sa.Column("data_source", sa.String(length=50), server_default="live", nullable=False),
        sa.Column("collected_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("is_demo_fixture", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("provenance", sa.String(length=50), server_default="live", nullable=False),
    )
    op.create_index("ix_kol_candidates_normalized_username", "kol_candidates", ["normalized_username"], unique=True)
    op.create_index("ix_kol_candidates_profile_url", "kol_candidates", ["profile_url"])
    op.create_index("ix_kol_candidates_data_source", "kol_candidates", ["data_source"])
    op.create_index("ix_kol_candidates_collected_at", "kol_candidates", ["collected_at"])

    # 2. Create kol_sample_videos table
    op.create_table(
        "kol_sample_videos",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("kol_candidate_id", sa.String(length=36), sa.ForeignKey("kol_candidates.id", ondelete="CASCADE"), nullable=False),
        sa.Column("video_id", sa.String(length=100), nullable=False),
        sa.Column("video_url", sa.String(length=512), nullable=False),
        sa.Column("caption", sa.Text(), nullable=True),
        sa.Column("hashtags", sa.JSON(), server_default="[]", nullable=False),
        sa.Column("views", sa.Integer(), nullable=True),
        sa.Column("likes", sa.Integer(), nullable=True),
        sa.Column("comments", sa.Integer(), nullable=True),
        sa.Column("shares", sa.Integer(), nullable=True),
        sa.Column("saves", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("collected_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_kol_sample_videos_kol_candidate_id", "kol_sample_videos", ["kol_candidate_id"])
    op.create_index("ix_kol_sample_videos_video_id", "kol_sample_videos", ["video_id"])

    # 3. Create kol_discovery_runs table
    op.create_table(
        "kol_discovery_runs",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("queries", sa.JSON(), server_default="[]", nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("status", sa.String(length=20), server_default="running", nullable=False),
        sa.Column("candidate_count", sa.Integer(), server_default="0", nullable=False),
        sa.Column("error", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("kol_discovery_runs")
    op.drop_index("ix_kol_sample_videos_video_id", table_name="kol_sample_videos")
    op.drop_index("ix_kol_sample_videos_kol_candidate_id", table_name="kol_sample_videos")
    op.drop_table("kol_sample_videos")
    op.drop_index("ix_kol_candidates_collected_at", table_name="kol_candidates")
    op.drop_index("ix_kol_candidates_data_source", table_name="kol_candidates")
    op.drop_index("ix_kol_candidates_profile_url", table_name="kol_candidates")
    op.drop_index("ix_kol_candidates_normalized_username", table_name="kol_candidates")
    op.drop_table("kol_candidates")
