"""phase4_recommendation_scoring

Revision ID: 2026_09_17_0003
Revises: 2026_09_17_0002
Create Date: 2026-09-17 22:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "2026_09_17_0003"
down_revision: Union[str, None] = "2026_09_17_0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "kol_recommendations",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("brand_identifier", sa.String(length=255), nullable=False),
        sa.Column("kol_username", sa.String(length=100), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.Column("final_score", sa.Float(), nullable=False),
        sa.Column("semantic_relevance_score", sa.Float(), nullable=False),
        sa.Column("engagement_quality_score", sa.Float(), nullable=False),
        sa.Column("local_content_relevance_score", sa.Float(), nullable=False),
        sa.Column("audience_fit_proxy", sa.Float(), nullable=True),
        sa.Column("brand_safety_score", sa.Float(), nullable=False),
        sa.Column("brand_safety_risk_level", sa.String(length=50), nullable=False, server_default="safe"),
        sa.Column("data_quality_score", sa.Float(), nullable=False),
        sa.Column("score_breakdown", sa.JSON(), server_default="{}", nullable=False),
        sa.Column("reasons", sa.JSON(), server_default="[]", nullable=False),
        sa.Column("cautions", sa.JSON(), server_default="[]", nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_kol_recommendations_brand_identifier", "kol_recommendations", ["brand_identifier"])
    op.create_index("ix_kol_recommendations_kol_username", "kol_recommendations", ["kol_username"])
    op.create_index("ix_kol_recommendations_final_score", "kol_recommendations", ["final_score"])


def downgrade() -> None:
    op.drop_index("ix_kol_recommendations_final_score", table_name="kol_recommendations")
    op.drop_index("ix_kol_recommendations_kol_username", table_name="kol_recommendations")
    op.drop_index("ix_kol_recommendations_brand_identifier", table_name="kol_recommendations")
    op.drop_table("kol_recommendations")
