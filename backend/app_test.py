import warnings
warnings.filterwarnings('ignore')
import sys

from app import app, db
import json

with app.app_context():
    from models.user import User
    admin = User.query.filter_by(email='admin@firma.com').first()
    if not admin:
        print('ERROR: no admin user')
        sys.exit(1)

    client = app.test_client()
    with client.session_transaction() as sess:
        sess['user_id'] = admin.id
        sess['role'] = admin.role

    for ep in [
        '/api/analytics/filter-options',
        '/api/analytics/apcb-pie',
        '/api/analytics/total-mh-pie?dimension=discipline',
        '/api/analytics/kar-zarar-trends?dimension=projects&year=2024',
    ]:
        r = client.get(ep)
        body = r.get_data(as_text=True)
        print(f'[{r.status_code}] {ep}')
        if r.status_code != 200:
            print('  ERROR:', body[:400])
        else:
            d = json.loads(body)
            # show data size
            if isinstance(d, dict):
                for k, v in d.items():
                    print(f'  key={k} len={len(v) if isinstance(v, (list,dict)) else v}')
            else:
                print(f'  len={len(d)}')
        print()
