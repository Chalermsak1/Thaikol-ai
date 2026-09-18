"""phase3_semantic_matching

Revision ID: 2026_09_17_0002
Revises: 2026_09_17_0001
Create Date: 2026-09-17 21:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "2026_09_17_0002"
down_revision: Union[str, None] = "2026_09_17_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "kol_semantic_matches",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("brand_identifier", sa.String(length=255), nullable=False),
        sa.Column("kol_candidate_id", sa.String(length=36), nullable=True),
        sa.Column("kol_username", sa.String(length=100), nullable=False),
        sa.Column("cosine_similarity", sa.Float(), nullable=False),
        sa.Column("semantic_relevance_score", sa.Float(), nullable=False),
        sa.Column("matching_topics", sa.JSON(), server_default="[]", nullable=False),
        sa.Column("embedding_model", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_kol_semantic_matches_brand_identifier", "kol_semantic_matches", ["brand_identifier"])
    op.create_index("ix_kol_semantic_matches_kol_username", "kol_semantic_matches", ["kol_username"])
    op.create_index("ix_kol_semantic_matches_kol_candidate_id", "kol_semantic_matches", ["kol_candidate_id"])


def downgrade() -> None:
    op.drop_index("ix_kol_semantic_matches_kol_candidate_id", table_name="kol_semantic_matches")
    op.drop_index("ix_kol_semantic_matches_kol_username", table_name="kol_semantic_matches")
    op.drop_index("ix_kol_semantic_matches_brand_identifier", table_name="kol_semantic_matches")
    op.drop_table("kol_semantic_matches")
