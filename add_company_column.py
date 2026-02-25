import psycopg2

conn = psycopg2.connect(
    dbname='antikarma_db',
    user='postgres',
    password='857587',
    host='localhost',
    port='5432'
)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE hourly_rates ADD COLUMN IF NOT EXISTS company VARCHAR(200)")
    conn.commit()
    print("[OK] Added 'company' column to hourly_rates table")
except Exception as e:
    print(f"[ERROR] {e}")
    conn.rollback()

cursor.close()
conn.close()
