"""Initialize all database tables"""
from app import app, db

print("Initializing database tables...")
with app.app_context():
    db.create_all()
    print("[OK] All tables created successfully!")
    
    # List created tables
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"\nCreated tables ({len(tables)}):")
    for table in sorted(tables):
        print(f"  ✓ {table}")
