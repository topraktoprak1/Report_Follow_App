from datetime import datetime
from models import db

class DatabaseRecord(db.Model):
    __tablename__ = 'database_record'
    
    id = db.Column(db.Integer, primary_key=True)
    personel = db.Column(db.String(120), nullable=False)
    data = db.Column(db.Text, nullable=False)  # JSON string of record data
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
