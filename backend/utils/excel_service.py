"""
Excel Data Service for handling DATABASE xlsb file operations
"""
import pandas as pd
import os
from datetime import datetime
from typing import Dict, List, Optional, Any
from models import db
from models.database_record import DatabaseRecord
from models.employee_info import EmployeeInfo
from models.hourly_rate import HourlyRate
import json

class ExcelDataService:
    def __init__(self):
        self.filepath = 'DATABASE 2026 W06 R1.xlsb'
        self.engine = 'pyxlsb'
        self._cache = {}
        self._last_loaded = None
    
    def get_file_path(self):
        """Get the full path to the Excel file"""
        return os.path.join(os.path.dirname(os.path.dirname(__file__)), self.filepath)
    
    def _load_excel_data(self, force_reload=False):
        """Load and cache Excel data"""
        if not force_reload and self._cache and self._last_loaded:
            # Check if cache is still fresh (within 5 minutes)
            if (datetime.now() - self._last_loaded).seconds < 300:
                return self._cache
        
        try:
            filepath = self.get_file_path()
            
            # Check if file exists
            if not os.path.exists(filepath):
                print(f"[WARNING] Excel file not found: {filepath}")
                return {}
            
            xls = pd.ExcelFile(filepath, engine=self.engine)
            
            cache = {
                'database': pd.read_excel(xls, 'DATABASE', engine=self.engine),
                'info': pd.read_excel(xls, 'Info', engine=self.engine),
                'hourly_rates': pd.read_excel(xls, 'Hourly Rates', engine=self.engine)
            }
            
            # Clean data
            for sheet_name, df in cache.items():
                # Replace NaN with None/empty strings
                cache[sheet_name] = df.where(pd.notnull(df), None)
            
            self._cache = cache
            self._last_loaded = datetime.now()
            return self._cache
            
        except Exception as e:
            print(f"Error loading Excel data: {e}")
            return {}
    
    def get_all_database_records(self, filters: Dict[str, Any] = None) -> List[Dict]:
        """Get all records from DATABASE sheet with optional filters"""
        data = self._load_excel_data()
        if 'database' not in data:
            return []
        
        df = data['database'].copy()
        
        # Apply filters if provided
        if filters:
            for field, value in filters.items():
                if field in df.columns and value is not None:
                    if isinstance(value, str):
                        df = df[df[field].astype(str).str.contains(value, case=False, na=False)]
                    else:
                        df = df[df[field] == value]
        
        # Convert to list of dictionaries
        records = []
        for _, row in df.iterrows():
            record = {}
            for col in df.columns:
                val = row[col]
                if pd.isna(val):
                    record[col] = None
                elif isinstance(val, (int, float)) and not pd.isna(val):
                    record[col] = float(val) if val != int(val) else int(val)
                else:
                    record[col] = str(val)
            records.append(record)
        
        return records
    
    def get_employee_info(self, employee_id: str = None) -> List[Dict]:
        """Get employee information from Info sheet"""
        data = self._load_excel_data()
        if 'info' not in data:
            return []
        
        df = data['info'].copy()
        
        if employee_id:
            df = df[df['ID'].astype(str) == str(employee_id)]
        
        return df.to_dict('records')
    
    def get_hourly_rates(self, employee_id: str = None) -> List[Dict]:
        """Get hourly rates information"""
        data = self._load_excel_data()
        if 'hourly_rates' not in data:
            return []
        
        df = data['hourly_rates'].copy()
        
        if employee_id and 'Unnamed: 0' in df.columns:  # ID column
            df = df[df['Unnamed: 0'].astype(str) == str(employee_id)]
        
        return df.to_dict('records')
    
    def get_project_data(self, project_name: str = None) -> List[Dict]:
        """Get project-specific data"""
        filters = {}
        if project_name:
            filters['Projects'] = project_name
        
        return self.get_all_database_records(filters)
    
    def get_company_data(self, company: str = None) -> List[Dict]:
        """Get company-specific data"""
        filters = {}
        if company:
            filters['Company'] = company
        
        return self.get_all_database_records(filters)
    
    def get_discipline_data(self, discipline: str = None) -> List[Dict]:
        """Get discipline-specific data"""
        filters = {}
        if discipline:
            filters['Discipline'] = discipline
        
        return self.get_all_database_records(filters)
    
    def get_summary_stats(self) -> Dict[str, Any]:
        """Get summary statistics from the data"""
        records = self.get_all_database_records()
        
        if not records:
            return {
                'total_records': 0,
                'total_cost': 0,
                'total_hours': 0,
                'active_projects': 0,
                'companies': [],
                'disciplines': []
            }
        
        # Calculate statistics
        total_records = len(records)
        total_cost = sum(float(r.get('General Total\n Cost (USD)', 0) or 0) for r in records)
        total_hours = sum(float(r.get('TOTAL\n MH', 0) or 0) for r in records)
        
        # Get unique values
        projects = list(set(r.get('Projects', '') for r in records if r.get('Projects')))
        companies = list(set(r.get('Company', '') for r in records if r.get('Company')))
        disciplines = list(set(r.get('Discipline', '') for r in records if r.get('Discipline')))
        
        return {
            'total_records': total_records,
            'total_cost': total_cost,
            'total_hours': total_hours,
            'active_projects': len(projects),
            'projects': projects[:10],  # Top 10 projects
            'companies': companies,
            'disciplines': disciplines
        }
    
    def get_monthly_data(self, year: int) -> List[float]:
        """Get monthly cost/revenue data for a specific year"""
        records = self.get_all_database_records()
        monthly_data = [0] * 12
        
        for record in records:
            date_str = record.get('(Week / \nMonth)') or ''
            cost = float(record.get('General Total\n Cost (USD)', 0) or 0)
            
            if date_str and cost:
                try:
                    # Try to parse the date and extract month/year
                    for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%Y/%m/%d", "%d/%m/%Y"):
                        try:
                            dt = datetime.strptime(str(date_str)[:10], fmt)
                            if dt.year == year:
                                monthly_data[dt.month - 1] += cost
                            break
                        except:
                            continue
                except:
                    continue
        
        return monthly_data
    
    def sync_to_database(self):
        """Sync Excel data to database tables"""
        try:
            # Clear existing data
            DatabaseRecord.query.delete()
            
            # Get all database records
            records = self.get_all_database_records()
            
            for record in records:
                # Create database record entry
                db_record = DatabaseRecord(
                    personel=record.get('Name Surname', ''),
                    data=json.dumps(record)
                )
                db.session.add(db_record)
            
            # Sync employee info
            employee_data = self.get_employee_info()
            for emp in employee_data:
                existing = EmployeeInfo.query.filter_by(employee_id=str(emp.get('ID', ''))).first()
                if not existing:
                    emp_info = EmployeeInfo(
                        employee_id=str(emp.get('ID', '')),
                        company=emp.get('Company', ''),
                        nationality=emp.get('Nationality', ''),
                        title=emp.get('FILYOS FPU\nTitle', ''),
                        function=emp.get('Function', ''),
                        discipline=emp.get('Discipline', ''),
                        projects=emp.get('Projects', ''),
                        reporting_manager=emp.get('Reporting', '')
                    )
                    db.session.add(emp_info)
            
            db.session.commit()
            return True
            
        except Exception as e:
            db.session.rollback()
            print(f"Error syncing to database: {e}")
            return False
    
    def search_records(self, search_term: str) -> List[Dict]:
        """Search records across all text fields"""
        records = self.get_all_database_records()
        
        if not search_term:
            return records
        
        search_term = search_term.lower()
        filtered_records = []
        
        for record in records:
            # Search across key text fields
            searchable_fields = [
                'Name Surname', 'Discipline', 'Company', 'Projects', 
                'Scope', 'Nationality', 'Office Location', 'Status'
            ]
            
            for field in searchable_fields:
                value = record.get(field, '')
                if value and search_term in str(value).lower():
                    filtered_records.append(record)
                    break
        
        return filtered_records

# Create a singleton instance
excel_service = ExcelDataService()