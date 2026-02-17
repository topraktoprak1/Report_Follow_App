from models import db
from datetime import datetime

class EmployeeInfo(db.Model):
    __tablename__ = 'employee_info'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    employee_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    
    # Core Info
    company = db.Column(db.String(100), nullable=True)
    nationality = db.Column(db.String(50), nullable=True)
    title = db.Column(db.String(100), nullable=True)
    function = db.Column(db.String(100), nullable=True)
    discipline = db.Column(db.String(100), nullable=True)
    projects = db.Column(db.Text, nullable=True)
    reporting_manager = db.Column(db.String(100), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'employeeId': self.employee_id,
            'company': self.company,
            'nationality': self.nationality,
            'title': self.title,
            'function': self.function,
            'discipline': self.discipline,
            'projects': self.projects,
            'reportingManager': self.reporting_manager,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
