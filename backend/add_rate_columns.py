"""
Add generic fields to hourly_rates table
Run this script once to add the new columns.
"""
import psycopg2
from psycopg2 import sql
import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

# Default values
DB_USER = 'postgres'
DB_PASS = '857587'
DB_HOST = 'localhost'
DB_PORT = '5432'
DB_NAME = 'antikarma_db'

# Parse DATABASE_URL if available
database_url = os.getenv('DATABASE_URL')
if database_url:
    try:
        result = urllib.parse.urlparse(database_url)
        DB_USER = result.username or DB_USER
        DB_PASS = result.password or DB_PASS
        DB_HOST = result.hostname or DB_HOST
        DB_PORT = result.port or DB_PORT
        if result.path and result.path != '/':
            DB_NAME = result.path.lstrip('/')
    except Exception as e:
        print(f"Warning: Could not parse DATABASE_URL: {e}")

def add_columns():
    """Add period, hourly_rate, and currency columns to hourly_rates table."""
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()
        
        # Check if columns already exist
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='hourly_rates'
        """)
        existing_columns = [row[0] for row in cursor.fetchall()]
        
        columns_to_add = []
        
        # Generic fields
        if 'period' not in existing_columns:
            columns_to_add.append("ADD COLUMN period VARCHAR(100)")
        if 'hourly_rate' not in existing_columns:
            columns_to_add.append("ADD COLUMN hourly_rate FLOAT")
        if 'currency' not in existing_columns:
            columns_to_add.append("ADD COLUMN currency VARCHAR(10)")
        
        # Legacy period fields
        if 'period_2023_2024' not in existing_columns:
            columns_to_add.append("ADD COLUMN period_2023_2024 FLOAT")
        if 'period_2025_h1' not in existing_columns:
            columns_to_add.append("ADD COLUMN period_2025_h1 FLOAT")
        if 'period_2025_h2' not in existing_columns:
            columns_to_add.append("ADD COLUMN period_2025_h2 FLOAT")
        if 'period_2026_h1' not in existing_columns:
            columns_to_add.append("ADD COLUMN period_2026_h1 FLOAT")
        if 'additional_rates' not in existing_columns:
            columns_to_add.append("ADD COLUMN additional_rates FLOAT")
        
        # Legacy currency fields
        if 'currency_2023_2024' not in existing_columns:
            columns_to_add.append("ADD COLUMN currency_2023_2024 VARCHAR(10)")
        if 'currency_2025_h1' not in existing_columns:
            columns_to_add.append("ADD COLUMN currency_2025_h1 VARCHAR(10)")
        if 'currency_2025_h2' not in existing_columns:
            columns_to_add.append("ADD COLUMN currency_2025_h2 VARCHAR(10)")
        if 'currency_2026_h1' not in existing_columns:
            columns_to_add.append("ADD COLUMN currency_2026_h1 VARCHAR(10)")
        if 'currency_additional' not in existing_columns:
            columns_to_add.append("ADD COLUMN currency_additional VARCHAR(10)")
        
        # Contract and company fields
        if 'contract_type' not in existing_columns:
            columns_to_add.append("ADD COLUMN contract_type VARCHAR(50)")
        if 'company' not in existing_columns:
            columns_to_add.append("ADD COLUMN company VARCHAR(100)")
        
        if columns_to_add:
            alter_sql = f"ALTER TABLE hourly_rates {', '.join(columns_to_add)}"
            print(f"Executing: {alter_sql}")
            cursor.execute(alter_sql)
            conn.commit()
            print(f"[OK] Successfully added {len(columns_to_add)} column(s) to hourly_rates table!")
        else:
            print("[OK] All columns already exist in hourly_rates table.")
        
        cursor.close()
        conn.close()
        return True
        
    except psycopg2.Error as e:
        print(f"[ERROR] {e}")
        return False

if __name__ == '__main__':
    print("Adding generic fields to hourly_rates table...")
    print(f"Database: {DB_NAME}")
    print(f"User: {DB_USER}")
    print(f"Host: {DB_HOST}:{DB_PORT}")
    print()
    
    if add_columns():
        print("\n[OK] Database migration completed successfully!")
    else:
        print("\n[ERROR] Migration failed!")
