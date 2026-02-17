import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import getpass
import sys

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

def create_database(password=None):
    """Create the antikarma_db database if it doesn't exist."""
    # Use provided password or fallback to config
    db_password = password if password is not None else DB_PASS
    
    try:
        # Connect to PostgreSQL server (default 'postgres' database)
        conn = psycopg2.connect(
            dbname='postgres',
            user=DB_USER,
            password="857587",
            host=DB_HOST,
            port=DB_PORT
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (DB_NAME,)
        )
        exists = cursor.fetchone()
        
        if exists:
            print(f"[OK] Database '{DB_NAME}' already exists.")
        else:
            # Create the database
            cursor.execute(
                sql.SQL("CREATE DATABASE {}").format(sql.Identifier(DB_NAME))
            )
            print(f"[OK] Database '{DB_NAME}' created successfully!")
        
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"[ERROR] {e}")
        print("\nPlease check:")
        print("1. PostgreSQL is running")
        print("2. Username and password are correct")
        print("3. PostgreSQL is accessible on localhost:5432")
        return False
    
    return True

if __name__ == '__main__':
    print(f"Creating PostgreSQL database: {DB_NAME}")
    print(f"User: {DB_USER}")
    print(f"Host: {DB_HOST}:{DB_PORT}")
    print()
    
    # Get password from user
    password = getpass.getpass(f"Enter password for PostgreSQL user '{DB_USER}': ")
    
    if create_database(password):
        print("\n[OK] You can now run your Flask application!")
        print("  Run: python app.py")
    else:
        sys.exit(1)
