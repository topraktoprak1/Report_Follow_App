"""Final verification: check user names and API endpoints."""
import requests, json, sys
sys.stdout.reconfigure(encoding='utf-8')

base = 'http://127.0.0.1:5174/api'

# 1. Check users
print('=== USERS (first 10) ===')
r = requests.get(f'{base}/users', timeout=10)
d = r.json()
users = d.get('users', [])
print(f'Total: {len(users)}')
for u in users[1:11]:  # Skip admin
    fn = u.get('firstName','')
    ln = u.get('lastName','')
    eid = u.get('employeeId','')
    # Check if name has numeric prefix
    has_issue = False
    try: float(fn); has_issue = True
    except: pass
    flag = ' *** STILL BROKEN' if has_issue else ' OK'
    print(f'  [{eid}] {fn} {ln}{flag}')

# 2. Check dashboard stats
print('\n=== DASHBOARD STATS ===')
r = requests.get(f'{base}/dashboard/stats', timeout=10)
print(json.dumps(r.json(), indent=2, ensure_ascii=False))

# 3. Check project-stats
print('\n=== PROJECT STATS ===')
r = requests.get(f'{base}/dashboard/project-stats', timeout=10)
d = r.json()
print(f'Active projects: {d.get("activeProjects")}')
print(f'Total tasks: {d.get("totalTasks")}')
print(f'Total MH: {d.get("totalMH")}')

print('\nDONE')
