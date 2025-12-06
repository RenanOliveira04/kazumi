"""add_escola_id_to_turmas

Revision ID: a1b2c3d4e5f6
Revises: 73b51b0ba65e
Create Date: 2025-12-06 09:38:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "a1b2c3d4e5f6"
down_revision = "73b51b0ba65e"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add escola_id column to turmas table
    op.add_column("turmas", sa.Column("escola_id", sa.Integer(), nullable=True))

    # Add foreign key constraint
    op.create_foreign_key(
        "fk_turmas_escola_id_escolas",  # constraint name
        "turmas",  # source table
        "escolas",  # target table
        ["escola_id"],  # source columns
        ["id"],  # target columns
        ondelete="SET NULL",
    )

    # Add index for performance
    op.create_index(op.f("ix_turmas_escola_id"), "turmas", ["escola_id"], unique=False)


def downgrade() -> None:
    # Remove index
    op.drop_index(op.f("ix_turmas_escola_id"), table_name="turmas")

    # Remove foreign key constraint
    op.drop_constraint("fk_turmas_escola_id_escolas", "turmas", type_="foreignkey")

    # Remove column
    op.drop_column("turmas", "escola_id")
