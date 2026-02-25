import os
import sys
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import getpass
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

def get_target_config():
    """Parse .env to find what user/password the app wants to use."""
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("Error: DATABASE_URL not found in .env")
        return None
        
    try:
        result = urllib.parse.urlparse(database_url)
        return {
            'user': result.username,
            'password': result.password,
            'host': result.hostname or 'localhost',
            'port': result.port or 5432,
            'dbname': result.path.lstrip('/') if result.path else 'antikarma_db'
        }
    except Exception as e:
        print(f"Error parsing DATABASE_URL: {e}")
        return None

def fix_user():
    config = get_target_config()
    if not config:
        return

    target_user = config['user']
    target_password = config['password']
    target_db = config['dbname']
    
    print(f"\n--- Database User Fixer ---")
    print(f"Goal: Ensure user '{target_user}' exists with the password from .env")
    print(f"Target Database: {target_db}\n")

    # We need superuser credentials to create/alter roles
    print("Please enter credentials for the 'postgres' (superuser) account.")
    print("If you don't know this, check POSTGRES_PASSWORD_HELP.md")
    
    postgres_password = getpass.getpass("Enter password for user 'postgres': ")
    
    try:
        # Connect as postgres
        conn = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            password=postgres_password,
            host=config['host'],
            port=config['port']
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        print("\n[✓] Connected to PostgreSQL as 'postgres'")

        # 1. Create or Update User
        # Check if user exists
        cursor.execute("SELECT 1 FROM pg_roles WHERE rolname=%s", (target_user,))
        exists = cursor.fetchone()
        
        if exists:
            print(f"[ ] User '{target_user}' exists. Updating password...")
            cursor.execute(
                sql.SQL("ALTER USER {} WITH PASSWORD %s").format(sql.Identifier(target_user)),
                (target_password,)
            )
            print(f"[✓] Password for '{target_user}' updated.")
        else:
            print(f"[ ] User '{target_user}' not found. Creating...")
            cursor.execute(
                sql.SQL("CREATE USER {} WITH PASSWORD %s CREATEDB").format(sql.Identifier(target_user)),
                (target_password,)
            )
            print(f"[✓] User '{target_user}' created.")

        # 2. Check Database
        cursor.execute("SELECT 1 FROM pg_database WHERE datname=%s", (target_db,))
        db_exists = cursor.fetchone()
        
        if not db_exists:
            print(f"[ ] Database '{target_db}' not found. Creating...")
            # We must be careful about owner. 
            cursor.execute(
                sql.SQL("CREATE DATABASE {} OWNER {}").format(
                    sql.Identifier(target_db),
                    sql.Identifier(target_user)
                )
            )
            print(f"[✓] Database '{target_db}' created.")
        else:
            print(f"[✓] Database '{target_db}' already exists.")
            # Verify owner permissions (optional, but good practice)
            # Simplified: just granting privileges is often safer than changing owner if db implies multiple things
            cursor.execute(
                sql.SQL("GRANT ALL PRIVILEGES ON DATABASE {} TO {}").format(
                    sql.Identifier(target_db),
                    sql.Identifier(target_user)
                )
            )
            print(f"[✓] Granted privileges on DATABASE '{target_db}' to '{target_user}'")

            # CRITICAL: In PostgreSQL 15+, we also need to grant permissions on the public schema explicitly
            try:
                # We need to connect TO the target database to grant schema permissions on it
                # But we are currently connected to 'postgres' db.
                # Use the current cursor to grant to the user if we can, but schema permissions 
                # are usually specific to the connected DB.
                # Actually, we can't easily switch DBs in one connection. 
                # Let's close and reconnect to the target db as postgres to grant schema permissions.
                pass 
            except Exception as e:
                print(f"[!] Warning during schema grant planning: {e}")

        # Reconnect to the target database as postgres to grant schema permissions
        cursor.close()
        conn.close()
        
        print(f"[ ] Connecting to '{target_db}' to grant schema permissions...")
        conn = psycopg2.connect(
            dbname=target_db,
            user='postgres',
            password=postgres_password,
            host=config['host'],
            port=config['port']
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Grant schema public permissions
        cursor.execute(
            sql.SQL("GRANT ALL ON SCHEMA public TO {}").format(
                sql.Identifier(target_user)
            )
        )
        print(f"[✓] Granted ALL on SCHEMA public to '{target_user}'")
        
        cursor.close()
        conn.close()

        print("\n[SUCCESS] Setup complete. You should now be able to run the app.")
        
    except psycopg2.OperationalError as e:
        print(f"\n[ERROR] Could not connect to PostgreSQL: {e}")
        print("Most likely the 'postgres' password you entered was incorrect.")
    except Exception as e:
        print(f"\n[ERROR] An unexpected error occurred: {e}")

if __name__ == "__main__":
    fix_user()
