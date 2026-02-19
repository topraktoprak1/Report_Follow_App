import psycopg2

conn = psycopg2.connect(
    dbname='antikarma_db',
    user='postgres',
    password='857587',
    host='localhost',
    port='5432'
)
cursor = conn.cursor()

# Get the actual table definition
cursor.execute("""
    SELECT column_name, data_type, character_maximum_length
    FROM information_schema.columns 
    WHERE table_name='hourly_rates'
    ORDER BY ordinal_position
""")
columns = cursor.fetchall()
print("=" * 60)
print("HOURLY_RATES TABLE STRUCTURE")  
print("=" * 60)
for col_name, data_type, max_len in columns:
    length_info = f"({max_len})" if max_len else ""
    print(f"  {col_name:25s} {data_type:15s} {length_info}")

print(f"\n Total columns: {len(columns)}")

# Try a simple query
cursor.execute("SELECT COUNT(*) FROM hourly_rates")
count = cursor.fetchone()[0]
print(f" Row count: {count}")

cursor.close()
conn.close()
