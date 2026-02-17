from datetime import datetime
from models import db

class SavedFilter(db.Model):
    __tablename__ = 'saved_filter'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    filter_name = db.Column(db.String(200), nullable=False)
    filter_type = db.Column(db.String(50), nullable=False)  # 'database', 'pivot', 'graph'
    filter_config = db.Column(db.Text, nullable=False)  # JSON string of filter configuration
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
