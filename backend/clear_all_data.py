"""
Clear all data from the database (except admin user)
Run this to completely reset the system for fresh import
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

def clear_all_data():
    """Clear all data from all tables except admin user."""
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            host=DB_HOST,
            port=DB_PORT
        )
        cursor = conn.cursor()
        
        print("[1/5] Clearing DatabaseRecord table...")
        cursor.execute("DELETE FROM database_record")
        count1 = cursor.rowcount
        print(f"   ✓ Deleted {count1} records")
        
        print("[2/5] Clearing HourlyRate table...")
        cursor.execute("DELETE FROM hourly_rates")
        count2 = cursor.rowcount
        print(f"   ✓ Deleted {count2} rates")
        
        print("[3/5] Clearing EmployeeInfo table...")
        cursor.execute("DELETE FROM employee_info")
        count3 = cursor.rowcount
        print(f"   ✓ Deleted {count3} employee info records")
        
        print("[4/5] Clearing Users (keeping admin)...")
        cursor.execute("DELETE FROM users WHERE role != 'admin'")
        count4 = cursor.rowcount
        print(f"   ✓ Deleted {count4} users (kept admin)")
        
        count5 = 0
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("\n" + "="*60)
        print("✅ DATABASE CLEARED SUCCESSFULLY!")
        print("="*60)
        print(f"Total records deleted:")
        print(f"  - Work Records: {count1}")
        print(f"  - Hourly Rates: {count2}")
        print(f"  - Employee Info: {count3}")
        print(f"  - Users: {count4}")
        print("="*60)
        return True
        
    except psycopg2.Error as e:
        print(f"[ERROR] {e}")
        return False

def delete_uploaded_files():
    """Delete uploaded Excel files"""
    import tempfile
    
    upload_folder = os.path.join(tempfile.gettempdir(), 'antikarma_uploads')
    if os.path.exists(upload_folder):
        count = 0
        for file in os.listdir(upload_folder):
            if file.endswith(('.xlsx', '.xls', '.xlsb')):
                os.remove(os.path.join(upload_folder, file))
                count += 1
                print(f"   ✓ Deleted file: {file}")
        print(f"\n📁 Deleted {count} uploaded file(s)")
    else:
        print("\n📁 No uploaded files found")

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🗑️  CLEAR ALL DATA - COMPLETE RESET")
    print("="*60)
    print(f"Database: {DB_NAME}")
    print(f"User: {DB_USER}")
    print(f"Host: {DB_HOST}:{DB_PORT}")
    print("="*60)
    print("\nThis will DELETE ALL data except admin user!")
    
    confirm = input("\nType 'YES' to confirm: ")
    
    if confirm.strip().upper() == 'YES':
        print("\n🔄 Starting cleanup...\n")
        if clear_all_data():
            delete_uploaded_files()
            print("\n✅ System is now completely clean!")
            print("You can now upload your Excel file again.\n")
        else:
            print("\n❌ Cleanup failed!\n")
    else:
        print("\n❌ Operation cancelled.\n")
