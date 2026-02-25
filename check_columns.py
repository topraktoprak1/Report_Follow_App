import psycopg2

conn = psycopg2.connect(
    dbname='antikarma_db',
    user='postgres',
    password='857587',
    host='localhost',
    port='5432'
)
cursor = conn.cursor()
cursor.execute("""
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name='hourly_rates'
    ORDER BY ordinal_position
""")
columns = cursor.fetchall()
print("Columns in hourly_rates table:")
for col in columns:
    print(f"  - {col[0]}")
cursor.close()
conn.close()
