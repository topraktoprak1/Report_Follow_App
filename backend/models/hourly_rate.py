from models import db
from datetime import datetime

class HourlyRate(db.Model):
    __tablename__ = 'hourly_rates'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    employee_id = db.Column(db.String(50), nullable=False, index=True)
    
    # Different rate periods
    period_2023_2024 = db.Column(db.Float, nullable=True)
    period_2025_h1 = db.Column(db.Float, nullable=True)  # 2025 first half
    period_2025_h2 = db.Column(db.Float, nullable=True)  # 2025 second half
    period_2026_h1 = db.Column(db.Float, nullable=True)  # 2026 first half
    additional_rates = db.Column(db.Float, nullable=True)
    
    # Currencies for each period
    currency_2023_2024 = db.Column(db.String(10), nullable=True)
    currency_2025_h1 = db.Column(db.String(10), nullable=True)
    currency_2025_h2 = db.Column(db.String(10), nullable=True)
    currency_2026_h1 = db.Column(db.String(10), nullable=True)
    currency_additional = db.Column(db.String(10), nullable=True)
    
    # Contract and base rate info
    contract_type = db.Column(db.String(50), nullable=True)
    company = db.Column(db.String(100), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'employeeId': self.employee_id,
            'rates': {
                '2023-2024': {
                    'rate': self.period_2023_2024,
                    'currency': self.currency_2023_2024
                },
                '2025_h1': {
                    'rate': self.period_2025_h1,
                    'currency': self.currency_2025_h1
                },
                '2025_h2': {
                    'rate': self.period_2025_h2,
                    'currency': self.currency_2025_h2
                },
                '2026_h1': {
                    'rate': self.period_2026_h1,
                    'currency': self.currency_2026_h1
                },
                'additional': {
                    'rate': self.additional_rates,
                    'currency': self.currency_additional
                }
            },
            'contractType': self.contract_type,
            'company': self.company,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
