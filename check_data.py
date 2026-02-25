import psycopg2

conn = psycopg2.connect(
    dbname='antikarma_db',
    user='postgres',
    password='857587',
    host='localhost',
    port='5432'
)
cursor = conn.cursor()

# Check record counts
cursor.execute("SELECT COUNT(*) FROM database_records")
db_count = cursor.fetchone()[0]
print(f"DatabaseRecord count: {db_count}")

cursor.execute("SELECT COUNT(*) FROM users WHERE role != 'admin'")
user_count = cursor.fetchone()[0]
print(f"User count (non-admin): {user_count}")

cursor.execute("SELECT COUNT(*) FROM employee_info")
info_count = cursor.fetchone()[0]
print(f"EmployeeInfo count: {info_count}")

cursor.execute("SELECT COUNT(*) FROM hourly_rates")
rate_count = cursor.fetchone()[0]
print(f"HourlyRate count: {rate_count}")

# If there are database records, show a sample
if db_count > 0:
    cursor.execute("SELECT personel, data FROM database_records LIMIT 1")
    sample = cursor.fetchone()
    print(f"\nSample record:")
    print(f"  Person: {sample[0]}")
    print(f"  Data (first 200 chars): {sample[1][:200]}...")

cursor.close()
conn.close()
