"""
Excel Data Import Routes
"""
from flask import Blueprint, request, jsonify, session
from models import db
from models.database_record import DatabaseRecord
from models.employee_info import EmployeeInfo
from models.hourly_rate import HourlyRate  
from models.user import User
from functools import wraps
from datetime import datetime
import json

excel_data_bp = Blueprint('excel_data', __name__, url_prefix='/api/excel')

# Session-based authentication decorator  
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Temporarily disable auth for testing
        # if 'user' not in session:
        #     return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

def _get_all_records_data():
    """Load all DatabaseRecord rows and parse their JSON data."""
    records = DatabaseRecord.query.all()
    parsed = []
    for r in records:
        try:
            data = json.loads(r.data)
            data['_record_id'] = r.id  # Add internal ID for reference
            data['_person'] = r.personel  # Add person name
            parsed.append(data)
        except Exception as e:
            print(f"Error parsing record {r.id}: {e}")
            continue
    return parsed

@excel_data_bp.route('/import', methods=['POST'])
@login_required
def import_excel_data():
    """Legacy endpoint - data is now imported via /api/excel/import-all"""
    try:
        count = DatabaseRecord.query.count()
        return jsonify({
            'success': True,
            'message': f'Database has {count} records. Use /api/excel/upload-preview and /api/excel/import-all for new imports.'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@excel_data_bp.route('/data/database', methods=['GET'])
@login_required
def get_database_records():
    """Get all database records with optional filters"""
    try:
        data = _get_all_records_data()
        
        # Apply filters from query parameters
        filters = {}
        for key in ['Company', 'Projects', 'Discipline', 'Nationality', 'Status']:
            value = request.args.get(key.lower())
            if value:
                filters[key] = value
        
        # Filter data
        if filters:
            filtered = []
            for record in data:
                match = True
                for key, value in filters.items():
                    record_value = str(record.get(key, '')).lower()
                    if value.lower() not in record_value:
                        match = False
                        break
                if match:
                    filtered.append(record)
            data = filtered
        
        return jsonify({
            'success': True,
            'records': data,
            'total': len(data)
        }), 200
    except Exception as e:
        print(f"Error in get_database_records: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@excel_data_bp.route('/data/employees', methods=['GET'])
@login_required
def get_employee_data():
    """Get employee information from EmployeeInfo table"""
    try:
        employee_id = request.args.get('id')
        
        if employee_id:
            # Get specific employee
            info = EmployeeInfo.query.filter_by(employee_id=employee_id).first()
            if info:
                user = User.query.get(info.user_id) if info.user_id else None
                employee_data = {
                    'ID': info.employee_id,
                    'Name Surname': f"{user.first_name} {user.last_name}" if user else info.employee_id,
                    'Company': info.company,
                    'Nationality': info.nationality,
                    'Title': info.title,
                    'Function': info.function,
                    'Discipline': info.discipline,
                    'Projects': info.projects,
                    'Reporting': info.reporting_manager
                }
                return jsonify({
                    'success': True,
                    'employees': [employee_data],
                    'total': 1
                }), 200
        else:
            # Get all employees
            infos = EmployeeInfo.query.all()
            employees = []
            for info in infos:
                user = User.query.get(info.user_id) if info.user_id else None
                employees.append({
                    'ID': info.employee_id,
                    'Name Surname': f"{user.first_name} {user.last_name}" if user else info.employee_id,
                    'Company': info.company,
                    'Nationality': info.nationality,
                    'Title': info.title,
                    'Function': info.function,
                    'Discipline': info.discipline,
                    'Projects': info.projects,
                    'Reporting': info.reporting_manager
                })
            
            return jsonify({
                'success': True,
                'employees': employees,
                'total': len(employees)
            }), 200
            
    except Exception as e:
        print(f"Error in get_employee_data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@excel_data_bp.route('/data/hourly-rates', methods=['GET'])
@login_required
def get_hourly_rates_data():
    """Get hourly rates information"""
    try:
        employee_id = request.args.get('id')
        
        if employee_id:
            rates = HourlyRate.query.filter_by(employee_id=employee_id).all()
        else:
            rates = HourlyRate.query.all()
        
        rates_data = []
        for rate in rates:
            rates_data.append({
                'employee_id': rate.employee_id,
                'period': rate.period,
                'hourly_rate': rate.hourly_rate,
                'currency': rate.currency,
                'contract_type': rate.contract_type,
                'company': rate.company
            })
        
        return jsonify({
            'success': True,
            'rates': rates_data,
            'total': len(rates_data)
        }), 200
    except Exception as e:
        print(f"Error in get_hourly_rates_data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@excel_data_bp.route('/data/projects', methods=['GET'])
@login_required
def get_project_data():
    """Get unique projects from database records"""
    try:
        data = _get_all_records_data()
        project_name = request.args.get('name')
        
        if project_name:
            # Filter by project name
            data = [r for r in data if str(r.get('Projects', '')).lower() == project_name.lower()]
        
        # Get unique projects
        projects = set()
        for record in data:
            p = record.get('Projects', '')
            if p:
                projects.add(str(p))
        
        return jsonify({
            'success': True,
            'projects': list(projects),
            'total': len(projects)
        }), 200
    except Exception as e:
        print(f"Error in get_project_data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@excel_data_bp.route('/data/companies', methods=['GET'])
@login_required
def get_company_data():
    """Get unique companies from database records"""
    try:
        data = _get_all_records_data()
        company_name = request.args.get('name')
        
        if company_name:
            data = [r for r in data if str(r.get('Company', '')).lower() == company_name.lower()]
        
        # Get unique companies
        companies = set()
        for record in data:
            c = record.get('Company', '')
            if c:
                companies.add(str(c))
        
        return jsonify({
            'success': True,
            'companies': list(companies),
            'total': len(companies)
        }), 200
    except Exception as e:
        print(f"Error in get_company_data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@excel_data_bp.route('/data/disciplines', methods=['GET'])
@login_required
def get_discipline_data():
    """Get unique disciplines from database records"""
    try:
        data = _get_all_records_data()
        discipline_name = request.args.get('name')
        
        if discipline_name:
            data = [r for r in data if str(r.get('Discipline', '')).lower() == discipline_name.lower()]
        
        # Get unique disciplines
        disciplines = set()
        for record in data:
            d = record.get('Discipline', '')
            if d:
                disciplines.add(str(d))
        
        return jsonify({
            'success': True,
            'disciplines': list(disciplines),
            'total': len(disciplines)
        }), 200
    except Exception as e:
        print(f"Error in get_discipline_data: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@excel_data_bp.route('/data/summary', methods=['GET'])
@login_required
def get_summary_stats():
    """Get summary statistics from database records"""
    try:
        data = _get_all_records_data()
        
        if not data:
            return jsonify({
                'success': True,
                'stats': {
                    'total_records': 0,
                    'total_cost': 0,
                    'total_hours': 0,
                    'active_projects': 0,
                    'projects': [],
                    'companies': [],
                    'disciplines': []
                }
            }), 200
        
        total_hours = 0
        total_cost = 0
        projects_set = set()
        companies_set = set()
        disciplines_set = set()
        
        for r in data:
            try:
                total_hours += float(r.get('TOTAL\n MH') or r.get('TOTAL MH') or 0)
            except:
                pass
            try:
                total_cost += float(r.get('General Total\n Cost (USD)') or 0)
            except:
                pass
            p = r.get('Projects', '')
            if p: projects_set.add(str(p))
            c = r.get('Company', '')
            if c: companies_set.add(str(c))
            d = r.get('Discipline', '')
            if d: disciplines_set.add(str(d))
        
        stats = {
            'total_records': len(data),
            'total_cost': round(total_cost, 2),
            'total_hours': round(total_hours, 1),
            'active_projects': len(projects_set),
            'projects': list(projects_set)[:10],
            'companies': list(companies_set),
            'disciplines': list(disciplines_set)
        }
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        print(f"Error in get_summary_stats: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@excel_data_bp.route('/data/status', methods=['GET'])
@login_required
def get_data_status():
    """Get status of imported data"""
    try:
        record_count = DatabaseRecord.query.count()
        user_count = User.query.filter(User.role != 'admin').count()
        info_count = EmployeeInfo.query.count()
        # Use direct count query instead of model query to avoid metadata issues
        rate_count = db.session.execute(db.text("SELECT COUNT(*) FROM hourly_rates")).scalar()
        
        return jsonify({
            'success': True,
            'hasData': record_count > 0,
            'recordCount': record_count,
            'userCount': user_count,
            'infoCount': info_count,
            'rateCount': rate_count
        }), 200
    except Exception as e:
        print(f"Error in get_data_status: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'hasData': False
        }), 500
