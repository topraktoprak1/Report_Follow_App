"""add generic rate fields to hourly_rates

Revision ID: add_generic_fields
Revises: 
Create Date: 2026-02-17

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_generic_fields'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to hourly_rates table
    op.add_column('hourly_rates', sa.Column('period', sa.String(100), nullable=True))
    op.add_column('hourly_rates', sa.Column('hourly_rate', sa.Float(), nullable=True))
    op.add_column('hourly_rates', sa.Column('currency', sa.String(10), nullable=True))


def downgrade():
    # Remove the columns if we need to rollback
    op.drop_column('hourly_rates', 'currency')
    op.drop_column('hourly_rates', 'hourly_rate')
    op.drop_column('hourly_rates', 'period')
