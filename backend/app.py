# Database initialization function
def init_db():
    db.create_all()
    # Create admin if not exists
    admin = User.query.filter_by(email='admin@firma.com').first()
    if not admin:
        admin = User(
            email='admin@firma.com',
            first_name='Admin',
            last_name='User',
            role='admin',
            is_active=True
        )
        admin.set_password('admin123')
        db.session.add(admin)
        db.session.commit()
        print('[OK] Admin user created: admin@firma.com / admin123')
    else:
        print('[OK] Database initialized')

from flask import Flask, render_template, request, jsonify, send_file, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
import json
import os
from datetime import datetime
import io
from functools import wraps

app = Flask(__name__)

# Enable CORS for React frontend (include Vite dev server origins)
# Allow CORS for development (allow all origins temporarily)
CORS(app, 
     supports_credentials=True, 
     resources={r"/*": {
         "origins": "*",
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         "allow_headers": ["Content-Type", "Authorization", "Accept"],
         "expose_headers": ["Content-Type", "Authorization"],
         "max_age": 3600
     }})

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response


@app.route('/api/health')
def health_check():
    """Health check endpoint for Docker and monitoring"""
    try:
        # Check database connection using SQLAlchemy 2.x syntax
        from sqlalchemy import text
        db.session.execute(text('SELECT 1'))
        db.session.commit()
        return jsonify({"status": "healthy", "database": "connected"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 503

@app.route('/')
def root_data():
    print(f"[LOG] Received request for / from {request.remote_addr} Origin: {request.headers.get('Origin')}")
    
    # Try to get data from Excel service first, fallback to database
    try:
        from utils.excel_service import excel_service
        records = excel_service.get_all_database_records()
        print(f"[LOG] Loaded {len(records)} records from Excel service")
        
        if not records:  # Fallback to database if Excel data is empty
            print("[LOG] Excel data empty, falling back to database")
            db_records = DatabaseRecord.query.order_by(DatabaseRecord.id.desc()).all()
            records = [json.loads(r.data) for r in db_records]
        
        data = records
    except Exception as e:
        print(f"[ERROR] Failed to load Excel data: {e}")
        # Fallback to database
        db_records = DatabaseRecord.query.order_by(DatabaseRecord.id.desc()).all()
        data = [json.loads(r.data) for r in db_records]

    # Calculate summary fields for dashboard
    totalEklenen = len(data)
    yeniEklenen = len([r for r in data if r.get('Status', '').lower() == 'yeni']) if data else 0
    
    # Calculate total cost from Excel data structure
    toplamKar = 0
    for r in data:
        cost_value = r.get('General Total\n Cost (USD)') or r.get('KAR-ZARAR') or 0
        if cost_value:
            try:
                toplamKar += float(cost_value)
            except:
                pass

    # Support ?year=YYYY for MonthlySalesChart
    year = request.args.get('year', type=int)
    sales = None
    if year:
        try:
            from utils.excel_service import excel_service
            sales = excel_service.get_monthly_data(year)
        except:
            # Fallback to old method
            sales_by_month = [0] * 12
            for r in data:
                date_str = r.get('(Week / \nMonth)') or r.get('(Week / Month)') or r.get('Tarih') or r.get('Date')
                kar_zarar = float(r.get('General Total\n Cost (USD)') or r.get('KAR-ZARAR', 0) or 0)
                if date_str:
                    try:
                        # Try to extract month and year
                        dt = None
                        for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%Y/%m/%d", "%d/%m/%Y"):
                            try:
                                dt = datetime.strptime(str(date_str)[:10], fmt)
                                break
                            except Exception:
                                continue
                        if dt and dt.year == year:
                            sales_by_month[dt.month - 1] += kar_zarar
                    except Exception:
                        continue
            sales = sales_by_month

    response = {
        "success": True,
        "records": data,
        "totalEklenen": totalEklenen,
        "yeniEklenen": yeniEklenen,
        "toplamKar": toplamKar
    }
    if sales is not None:
        response["sales"] = sales
    return jsonify(response)

@app.route('/api/data')
def get_data():
    print(f"[LOG] Received request for /api/data from {request.remote_addr} Origin: {request.headers.get('Origin')}")
    
    # Try to get data from Excel service first, fallback to database
    try:
        from utils.excel_service import excel_service
        records = excel_service.get_all_database_records()
        print(f"[LOG] Loaded {len(records)} records from Excel service")
        
        if not records:  # Fallback to database if Excel data is empty
            print("[LOG] Excel data empty, falling back to database")
            db_records = DatabaseRecord.query.order_by(DatabaseRecord.id.desc()).all()
            records = [json.loads(r.data) for r in db_records]
        
        data = records
    except Exception as e:
        print(f"[ERROR] Failed to load Excel data: {e}")
        # Fallback to database
        db_records = DatabaseRecord.query.order_by(DatabaseRecord.id.desc()).all()
        data = [json.loads(r.data) for r in db_records]

    # Calculate summary fields for dashboard
    totalEklenen = len(data)
    yeniEklenen = len([r for r in data if r.get('Status', '').lower() == 'yeni']) if data else 0
    
    # Calculate total cost from Excel data structure
    toplamKar = 0
    for r in data:
        cost_value = r.get('General Total\n Cost (USD)') or r.get('KAR-ZARAR') or 0
        if cost_value:
            try:
                toplamKar += float(cost_value)
            except:
                pass

    # Support ?year=YYYY for MonthlySalesChart
    year = request.args.get('year', type=int)
    sales = None
    if year:
        try:
            from utils.excel_service import excel_service
            sales = excel_service.get_monthly_data(year)
        except:
            # Fallback to old method
            sales_by_month = [0] * 12
            for r in data:
                date_str = r.get('(Week / \nMonth)') or r.get('(Week / Month)') or r.get('Tarih') or r.get('Date')
                kar_zarar = float(r.get('General Total\n Cost (USD)') or r.get('KAR-ZARAR', 0) or 0)
                if date_str:
                    try:
                        # Try to extract month and year
                        dt = None
                        for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%Y/%m/%d", "%d/%m/%Y"):
                            try:
                                dt = datetime.strptime(str(date_str)[:10], fmt)
                                break
                            except Exception:
                                continue
                        if dt and dt.year == year:
                            sales_by_month[dt.month - 1] += kar_zarar
                    except Exception:
                        continue
            sales = sales_by_month

    response = {
        "success": True,
        "records": data,
        "totalEklenen": totalEklenen,
        "yeniEklenen": yeniEklenen,
        "toplamKar": toplamKar
    }
    if sales is not None:
        response["sales"] = sales
    return jsonify(response)

# New endpoint for StatisticsChart and PieChart
@app.route('/api/stats')
def get_stats():
    records = DatabaseRecord.query.order_by(DatabaseRecord.id.desc()).all()
    data = [json.loads(r.data) for r in records]
    
    apcb_keywords = ['AP-CB']
    subcon_keywords = ['Subcon']

    apcb = sum(1 for r in data if any(kw in r.get('AP-CB / Subcon', '') for kw in apcb_keywords))
    subcon = sum(1 for r in data if any(kw in r.get('AP-CB / Subcon', '') for kw in subcon_keywords))
    return jsonify({"apcb": apcb, "subcon": subcon})

@app.route('/api/auto-calculated-fields')
def get_auto_calculated_fields():
    """Return metadata about auto-calculated fields"""
    auto_fields = {
        'fields': [
            {
                'name': 'North/South',
                'description': 'Automatically determined from Scope using XLOOKUP from Info sheet',
                'formula': 'XLOOKUP($G, Info!$N:$N, Info!$Q:$Q)',
                'icon': 'compass'
            },
            {
                'name': 'Currency',
                'description': 'Auto-determined from ID (TL for 905264, otherwise from Hourly Rates)',
                'formula': 'IF(A=905264,"TL",XLOOKUP($A,\'Hourly Rates\'!$A:$A,\'Hourly Rates\'!$G:$G))',
                'icon': 'dollar-sign'
            },
            {
                'name': 'Projects/Group',
                'description': 'Automatically looked up from Projects using Info sheet',
                'formula': 'XLOOKUP($H, Info!$O:$O, Info!$P:$P)',
                'icon': 'sitemap'
            },
            {
                'name': 'AP-CB/Subcon',
                'description': 'Categorized based on Company name (AP-CB if contains "AP-CB", else Subcon)',
                'formula': 'IF(ISNUMBER(SEARCH("AP-CB", E)), "AP-CB", "Subcon")',
                'icon': 'building'
            },
            {
                'name': 'LS/Unit Rate',
                'description': 'Lumpsum for specific companies or if Scope contains "Lumpsum", else Unit Rate',
                'formula': 'IF(OR((IFERROR(SEARCH("Lumpsum",G),0))>0,E="İ4",...), "Lumpsum", "Unit Rate")',
                'icon': 'calculator'
            },
            {
                'name': 'Hourly Base Rate',
                'description': 'Base rate from Hourly Rates sheet based on ID and rate type',
                'formula': 'XLOOKUP with conditional column selection based on AP-CB/Subcon and LS/Unit Rate',
                'icon': 'clock'
            },
            {
                'name': 'Hourly Additional Rates',
                'description': 'Additional rates (0 for Lumpsum/AP-CB, else from Hourly Rates with currency conversion)',
                'formula': 'Complex nested IF with XLOOKUP and TCMB rate conversion',
                'icon': 'plus-circle'
            },
            {
                'name': 'Hourly Rate',
                'description': 'Sum of Hourly Base Rate and Hourly Additional Rates',
                'formula': 'Hourly Base Rate + Hourly Additional Rates',
                'icon': 'money-bill-wave'
            },
            {
                'name': 'Cost',
                'description': 'Total cost calculated as Hourly Rate × TOTAL MH',
                'formula': 'Hourly Rate × TOTAL MH',
                'icon': 'coins'
            },
            {
                'name': 'General Total Cost (USD)',
                'description': 'Cost converted to USD using TCMB exchange rates',
                'formula': 'Currency conversion based on TL or EURO rates from Info sheet',
                'icon': 'exchange-alt'
            },
            {
                'name': 'Hourly Unit Rate (USD)',
                'description': 'Unit rate in USD per man-hour',
                'formula': 'General Total Cost (USD) / TOTAL MH',
                'icon': 'divide'
            },
            {
                'name': 'İşveren-Hakediş Birim Fiyat',
                'description': 'Complex calculation based on NO-1, NO-2 values and Summary sheet',
                'formula': 'Complex nested IF with multiple XLOOKUP operations',
                'icon': 'file-invoice-dollar'
            },
            {
                'name': 'İşveren-Hakediş (USD)',
                'description': 'Total invoice amount in USD with currency conversion',
                'formula': 'İşveren-Hakediş × currency rate (if EURO)',
                'icon': 'receipt'
            },
            {
                'name': 'İşveren-Hakediş Birim Fiyat (USD)',
                'description': 'Unit price per man-hour for invoice',
                'formula': 'İşveren-Hakediş (USD) / (Kuzey MH-Person or TOTAL MH)',
                'icon': 'dollar-sign'
            },
            {
                'name': 'NO-1, NO-2, NO-3, NO-10',
                'description': 'Reference numbers from Info sheet for calculations',
                'formula': 'Various XLOOKUP operations from Info sheet',
                'icon': 'hashtag'
            },
            {
                'name': 'Control-1, TM Liste, TM Kod',
                'description': 'Control and tracking codes from Info sheet',
                'formula': 'XLOOKUP operations based on Projects',
                'icon': 'check-circle'
            },
            {
                'name': 'Kontrol-1, Kontrol-2',
                'description': 'Validation fields comparing calculated values',
                'formula': 'XLOOKUP and equality check (NO-1 = Kontrol-1)',
                'icon': 'shield-alt'
            }
        ],
        'total_auto_fields': 17,
        'manual_fields': [
            'ID', 'Name Surname', 'Discipline', '(Week / Month)', 'Company', 
            'Scope', 'Projects', 'Nationality', 'Office Location', 
            'TOTAL MH', 'Kuzey MH', 'Kuzey MH-Person', 'Status'
        ],
        'info': 'These fields are automatically calculated based on Excel formulas when adding or updating records'
    }
    return jsonify(auto_fields)


@app.route('/debug/routes')
def debug_routes():
    # Return a list of registered routes for debugging
    rules = []
    for rule in app.url_map.iter_rules():
        rules.append({'rule': str(rule), 'endpoint': rule.endpoint, 'methods': list(rule.methods)})
    return jsonify({'routes': rules})

# Security configuration
import secrets
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Session security
app.config['SESSION_COOKIE_SECURE'] = False  # Set True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour (3600 seconds)

# PostgreSQL configuration
# For local development, use: postgresql://username:password@localhost:5432/database_name
# For production, use environment variable
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 
    'postgresql://postgres:857587@localhost:5432/veri_analizi')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 10,
    'pool_recycle': 3600,
    'pool_pre_ping': True,
}

# Models imported from package
from models import db
from models.user import User
from models.database_record import DatabaseRecord
from models.saved_filter import SavedFilter

# Initialize database happens after app creation below
db.init_app(app)

# Cache for data to avoid reloading from database every time
_data_cache = {
    'data': None,
    'timestamp': None,
    'record_count': 0
}

def get_cache_key():
    """Get cache key based on database record count"""
    count = DatabaseRecord.query.count()
    return count

def clear_data_cache():
    """Clear the data cache"""
    global _data_cache
    _data_cache = {'data': None, 'timestamp': None, 'record_count': 0}



# File upload endpoint for frontend
@app.route('/upload', methods=['POST'])
def upload_file_simple():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    filename = secure_filename(file.filename)
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    file.save(save_path)
    # Optionally, process the file here (e.g., parse, store in DB, etc.)
    return jsonify({'success': True, 'filename': filename}), 200

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            # For API endpoints, return JSON error instead of redirect
            if request.path.startswith('/api/'):
                return jsonify({'error': 'Unauthorized'}), 401
            return redirect(url_for('login_page'))
        
        # Update last activity time to keep session alive
        session.modified = True
        
        return f(*args, **kwargs)
    return decorated_function

# Admin required decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session or session.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

# Create uploads folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Favorites file path
FAVORITES_FILE_PATH = os.path.join(os.path.dirname(__file__), 'favorite_reports.json')

# Register Blueprints
from routes.excel_upload import excel_bp
from routes.excel_data import excel_data_bp
app.register_blueprint(excel_bp)
app.register_blueprint(excel_data_bp)

# ============================================================================
# EXCEL FORMULA CALCULATION FUNCTIONS
# ============================================================================

# Cache for Excel reference data
_excel_cache = {
    'info_df': None,
    'hourly_rates_df': None,
    'summary_df': None,
    'file_path': None
}

def load_excel_reference_data(file_path=None):
    """Load Info, Hourly Rates, and Summary sheets from Excel file into cache"""
    global _excel_cache
    
    if file_path is None:
        # Try to find latest xlsb file in uploads
        upload_dir = app.config['UPLOAD_FOLDER']
        xlsb_files = [f for f in os.listdir(upload_dir) if f.endswith('.xlsb')]
        if not xlsb_files:
            return False
        xlsb_files.sort(reverse=True)
        file_path = os.path.join(upload_dir, xlsb_files[0])
    
    # Check if already cached
    if _excel_cache['file_path'] == file_path and _excel_cache['info_df'] is not None:
        return True
    
    try:
        # Read Info sheet
        df_info = pd.read_excel(file_path, sheet_name='Info', engine='pyxlsb')
        
        # Convert the Weeks/Month column (index 20) from Excel serial dates to readable format
        if len(df_info.columns) > 20:
            weeks_month_col = df_info.iloc[:, 20]
            df_info.iloc[:, 20] = weeks_month_col.apply(excel_date_to_string)
            print(f"[OK] Converted Info sheet Weeks/Month column to date strings")
        
        _excel_cache['info_df'] = df_info
        
        # Read Hourly Rates sheet (header on row 2)
        df_rates = pd.read_excel(file_path, sheet_name='Hourly Rates', engine='pyxlsb', header=1)
        _excel_cache['hourly_rates_df'] = df_rates
        
        # Try to read Summary sheet (may not exist in all files)
        try:
            df_summary = pd.read_excel(file_path, sheet_name='Summary', engine='pyxlsb')
            _excel_cache['summary_df'] = df_summary
        except:
            _excel_cache['summary_df'] = None
        
        _excel_cache['file_path'] = file_path
        print(f"✓ Loaded Excel reference data from {os.path.basename(file_path)}")
        return True
    except Exception as e:
        print(f"Error loading Excel reference data: {e}")
        return False

def xlookup(lookup_value, lookup_array, return_array, if_not_found=0):
    """Python implementation of Excel XLOOKUP function"""
    try:
        # Convert to pandas Series if needed
        if not isinstance(lookup_array, pd.Series):
            lookup_array = pd.Series(lookup_array)
        if not isinstance(return_array, pd.Series):
            return_array = pd.Series(return_array)
        
        # Handle different data types
        if pd.isna(lookup_value):
            return if_not_found
        
        # Try exact match first
        mask = lookup_array == lookup_value
        
        # If no exact match and both are strings, try normalized comparison
        if not mask.any() and isinstance(lookup_value, str):
            try:
                # Normalize by removing extra spaces and converting to uppercase
                normalized_lookup = ' '.join(str(lookup_value).strip().upper().split())
                normalized_array = lookup_array.astype(str).str.strip().str.upper().apply(lambda x: ' '.join(x.split()))
                mask = normalized_array == normalized_lookup
            except:
                pass
        
        if mask.any():
            idx = mask.idxmax()
            result = return_array.iloc[idx] if isinstance(return_array, pd.Series) else return_array[idx]
            return result if pd.notna(result) else if_not_found
        
        return if_not_found
    except Exception as e:
        print(f"XLOOKUP error: {e}")
        return if_not_found

def safe_float(value, default=0.0):
    """Safely convert value to float"""
    try:
        if pd.isna(value):
            return default
        return float(value)
    except:
        return default

def safe_str(value, default=''):
    """Safely convert value to string"""
    try:
        if pd.isna(value):
            return default
        return str(value).strip()
    except:
        return default

def excel_date_to_string(excel_date):
    """Convert Excel serial date number to YYYY-MM-DD string format"""
    try:
        if pd.isna(excel_date):
            return None
        # Check if it's already a string (like 'W49', 'W50')
        if isinstance(excel_date, str):
            excel_date_str = excel_date.strip()
            # Check if it's in dd/mmm/yyyy format (like "01/Jan/2023")
            if '/' in excel_date_str:
                try:
                    # Try to parse it and convert to YYYY-MM-DD
                    dt = pd.to_datetime(excel_date_str, format='%d/%b/%Y', errors='coerce')
                    if pd.notna(dt):
                        return dt.strftime('%Y-%m-%d')
                except:
                    pass
            return excel_date_str
        # Check if it's a datetime object
        if isinstance(excel_date, (pd.Timestamp, datetime)):
            return excel_date.strftime('%Y-%m-%d')
        # Check if it's an Excel serial number (integer or float)
        if isinstance(excel_date, (int, float)) and excel_date > 1000:
            # Excel serial date starts from 1900-01-01
            # Convert to pandas timestamp and then to string
            base_date = pd.Timestamp('1899-12-30')  # Excel's epoch
            date = base_date + pd.Timedelta(days=int(excel_date))
            return date.strftime('%Y-%m-%d')
        return str(excel_date).strip()
    except Exception as e:
        print(f"Error converting Excel date {excel_date}: {e}")
        return str(excel_date) if excel_date else None

def convert_week_codes_in_dataframe(df):
    """Convert week codes to dates"""
    import re
    from dateutil.relativedelta import relativedelta
    
    # Use default logic for now as it's complex
    return df

def calculate_auto_fields(record_data, file_path=None):
    """Calculate all auto-populated fields based on Excel formulas"""
    # Simply return existing data for now to keep it simple
    return record_data, []

def load_excel_data(file_path, user_filter=None):
    """Load Excel file and return DataFrame"""
    try:
        df = pd.read_excel(file_path, sheet_name='DATABASE', engine='openpyxl')
        return df
    except:
        try:
            df = pd.read_excel(file_path, sheet_name='DATABASE', engine='pyxlsb')
            return df
        except:
            return pd.DataFrame()

# API Endpoints for frontend integration

@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    """Compatibility endpoint for dashboard stats"""
    records = DatabaseRecord.query.all()
    count = len(records)
    # Mock data for now based on record count
    return jsonify({
        'activeProjects': 5, # Placeholder
        'totalTasks': count,
        'totalMH': 0,
        'avgProgress': 0
    })

@app.route('/api/dashboard/personnel', methods=['GET'])
def dashboard_personnel():
    """Compatibility endpoint for personnel list"""
    records = DatabaseRecord.query.all()
    personnel_list = []
    seen = set()
    
    for r in records:
        try:
            data = json.loads(r.data)
            name = data.get('Name Surname', '') or data.get('PERSONEL', '')
            if name and name not in seen:
                seen.add(name)
                personnel_list.append({
                    'id': r.id,
                    'name': name,
                    'department': data.get('Discipline', 'Unknown'),
                    'role': data.get('Title', 'Employee'),
                    'performance': 0
                })
        except:
            continue
            
    return jsonify(personnel_list)

@app.route('/api/dashboard/projects', methods=['GET'])
def dashboard_projects():
    """Compatibility endpoint for projects list"""
    records = DatabaseRecord.query.all()
    projects = set()
    
    for r in records:
        try:
            data = json.loads(r.data)
            p_name = data.get('Projects', '')
            if p_name:
                projects.add(p_name)
        except:
            continue
            
    result = [{'name': p, 'status': 'Active', 'completion': 0} for p in projects]
    return jsonify(result)

@app.route('/api/dashboard/project-stats', methods=['GET'])
def dashboard_project_stats():
    """Compatibility endpoint for project stats"""
    records = DatabaseRecord.query.all()
    
    projects = set()
    disciplines = {}
    
    for r in records:
        try:
            data = json.loads(r.data)
            p_name = data.get('Projects', '')
            disc = data.get('Discipline', 'Other')
            
            if p_name:
                projects.add(p_name)
            
            if disc:
                disciplines[disc] = disciplines.get(disc, 0) + 1
        except:
            continue
            
    # Color palette for charts
    colors = ['#00d4ff', '#8b5cf6', '#0cdba8', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#a855f7']
    
    # Format category data with colors
    category_data = []
    for i, (k, v) in enumerate(disciplines.items()):
        category_data.append({
            'name': k,
            'value': v,
            'color': colors[i % len(colors)]
        })
    
    # Mock project status distribution (since we don't have status in DB yet)
    # We'll distribute the count of unique projects across statuses
    total_projects = len(projects)
    active = int(total_projects * 0.6)
    completed = int(total_projects * 0.3)
    pending = total_projects - active - completed
    
    project_status = [
        {'name': 'Devam Ediyor', 'value': active, 'color': '#00d4ff'},
        {'name': 'Tamamlandı', 'value': completed, 'color': '#0cdba8'},
        {'name': 'Beklemede', 'value': pending, 'color': '#f59e0b'}
    ]

    # Calculate monthly man-hours
    monthly_mh = [0] * 12
    total_mh_sum = 0

    for r in records:
        try:
            data = json.loads(r.data)
            date_str = data.get('(Week / \nMonth)') or data.get('(Week / Month)') or data.get('Tarih') or data.get('Date')
            mh_val = data.get('TOTAL MH', 0)

            # Try to parse mh_val as float
            try:
                mh = float(mh_val)
            except:
                mh = 0

            total_mh_sum += mh

            if date_str and mh > 0:
                dt = None
                for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%Y/%m/%d", "%d/%m/%Y"):
                    try:
                        dt = datetime.strptime(str(date_str)[:10], fmt)
                        break
                    except Exception:
                        continue

                if dt:
                    monthly_mh[dt.month - 1] += mh
        except:
            continue

    # Format for frontend chart
    months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    monthly_trends = []
    for i, mh in enumerate(monthly_mh):
        monthly_trends.append({
            'name': months[i],
            'gerceklesen': round(mh, 1),
            'planlanan': round(mh * 1.1, 1) # Mock planned data as 110% of actual
        })
    
    # Check if category_data is empty and provide fallback
    if not category_data and len(records) > 0:
         category_data.append({'name': 'Genel', 'value': len(records), 'color': '#00d4ff'})

    return jsonify({
        'activeProjects': len(projects),
        'totalTasks': len(records),
        'totalMH': round(total_mh_sum, 1),
        'avgProgress': 65, # Mock average progress
        'categoryDistribution': category_data,
        'projectStatus': project_status,
        'monthlyTrends': monthly_trends
    })

@app.route('/api/auth/login', methods=['POST'])
def auth_login():
    """Login endpoint adapter"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email ve şifre gereklidir'}), 400
    
    # Try to find user by email
    user = User.query.filter_by(email=email).first()
    
    if user and user.check_password(password):
        if not user.is_active:
             return jsonify({'error': 'Hesabınız devre dışı bırakılmıştır'}), 401

        # Mock allowed pages for now - allow access to everything
        allowed_pages = [
            'proje-raporlama', 'proje-rapor-dagilimi', 'proje-ongoru-raporu',
            'kullanici-rapor-girisi', 'canli-sistem-kayitlari', 'personel-analiz-raporlari',
            'kullanici-profili', 'yetkilendirme-matrix', 'izin-talep-yonetimi',
            'kullanici-izin-detaylari', 'proje-detay-sayfasi', 'sistem-ayarlari', 'kullanici-yonetimi'
        ]
        
        session['user_id'] = user.id
        session['user'] = user.email # Use email as identifier in session
        session['role'] = user.role
        session['name'] = f"{user.first_name} {user.last_name}"
        
        return jsonify({
            'user': {
                'id': user.id,
                'name': f"{user.first_name} {user.last_name}",
                'email': user.email,
                'role': user.role
            },
            'token': 'mock-token',
            'allowedPages': allowed_pages
        })
    return jsonify({'error': 'Geçersiz email veya şifre'}), 401

@app.route('/api/auth/me', methods=['GET'])
def auth_me():
    """Get current user adapter"""
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            # Mock allowed pages for now
            allowed_pages = [
                'proje-raporlama', 'proje-rapor-dagilimi', 'proje-ongoru-raporu',
                'kullanici-rapor-girisi', 'canli-sistem-kayitlari', 'personel-analiz-raporlari',
                'kullanici-profili', 'yetkilendirme-matrix', 'izin-talep-yonetimi',
                'kullanici-izin-detaylari', 'proje-detay-sayfasi', 'sistem-ayarlari', 'kullanici-yonetimi'
            ]
            
            return jsonify({
                'user': {
                    'id': user.id,
                    'name': f"{user.first_name} {user.last_name}",
                    'email': user.email,
                    'role': user.role
                },
                'allowedPages': allowed_pages
            })
    return jsonify({'error': 'Not logged in'}), 401

@app.route('/api/users', methods=['GET'])
def list_users():
    """List users adapter"""
    users = User.query.all()
    user_list = []
    for u in users:
        user_list.append({
            'id': u.id,
            'firstName': u.first_name,
            'lastName': u.last_name,
            'email': u.email,
            'role': u.role,
            'isActive': u.is_active,
            'employeeId': u.employee_id,
            'createdAt': u.created_at.isoformat() if u.created_at else None,
            # 'profilePhoto': u.profile_photo # Model doesn't have profile_photo yet, or does it?
            # models/user.py didn't show profile_photo. Let's omit or mock it.
            'profilePhoto': 'img/avatars/avatar1.jpeg' 
        })
        
    return jsonify({'users': user_list})


if __name__ == '__main__':
    with app.app_context():
        init_db()
    
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5174)
