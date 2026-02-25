"""Fix user names: first_name is a pure float, last_name has the full name."""
import re
import psycopg2
import sys
sys.stdout.reconfigure(encoding='utf-8')

def is_numeric(s):
    try:
        float(s)
        return True
    except:
        return False

conn = psycopg2.connect(host='localhost', port=5432, dbname='veri_analizi', user='postgres', password='857587')
cur = conn.cursor()

cur.execute("SELECT id, first_name, last_name, employee_id FROM users")
rows = cur.fetchall()
print(f'Total users: {len(rows)}')

fixed = 0
for uid, fn, ln, eid in rows:
    if fn and is_numeric(fn.strip()):
        # first_name is numeric — extract real name from last_name
        parts = (ln or '').split(maxsplit=1)
        if len(parts) >= 2:
            new_fn = parts[0]
            new_ln = parts[1]
        elif len(parts) == 1:
            new_fn = parts[0]
            new_ln = '-'
        else:
            continue
        
        cur.execute("UPDATE users SET first_name=%s, last_name=%s WHERE id=%s", (new_fn, new_ln, uid))
        fixed += 1
        if fixed <= 10:
            print(f'  FIX [{eid}]: "{fn}"|"{ln}" -> "{new_fn}"|"{new_ln}"')

conn.commit()
print(f'\nFixed {fixed} users')

# Verify
print('\nVerification (first 10 with employee_id):')
cur.execute("SELECT employee_id, first_name, last_name FROM users WHERE employee_id IS NOT NULL ORDER BY id LIMIT 10")
for eid, fn, ln in cur.fetchall():
    print(f'  [{eid}] {fn} {ln}')

cur.close()
conn.close()
