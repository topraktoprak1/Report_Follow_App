import os
import re
import tempfile
# import pandas as pd (moved to functions)
from flask import Blueprint, request, jsonify, session
from functools import wraps
from models import db
from models.user import User


def clean_name(name_str):
    """Remove leading numeric prefixes from names imported from Excel.
    E.g. '7.0 Sedat Ertuğrul Özdilek' -> 'Sedat Ertuğrul Özdilek'
         '131.94930000000002 Elif Ayan Aktimur' -> 'Elif Ayan Aktimur'
         '0.0 Gülçe Hazal Ak' -> 'Gülçe Hazal Ak'
    """
    if not name_str or not isinstance(name_str, str):
        return name_str
    # Strip leading numbers (int or float patterns) followed by whitespace
    cleaned = re.sub(r'^\d+\.?\d*\s+', '', name_str.strip())
    return cleaned if cleaned else name_str


excel_bp = Blueprint('excel', __name__, url_prefix='/api/excel')

UPLOAD_FOLDER = os.path.join(tempfile.gettempdir(), 'antikarma_uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

REQUIRED_SHEETS = ['DATABASE', 'Info', 'Hourly Rates']

def role_required(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return jsonify({'error': 'Unauthorized'}), 401
            
            # Trust the session for role check to avoid DB instance conflicts
            user_role = session.get('role')
            if user_role != role and user_role != 'admin': # Admin always has access
                return jsonify({'error': 'Forbidden'}), 403
            
            # If the endpoint accepts 'current_user', pass a partial object or mock
            # But for delete, we don't really need it.
            # Let's inspect arguments or just pass nothing extra if not needed.
            # However, existing endpoints might expect it.
            # We'll construct a simple object from session data.
            class SessionUser:
                def __init__(self, uid, email, role):
                    self.id = uid
                    self.email = email
                    self.role = role
            
            current_user = SessionUser(session.get('user_id'), session.get('email', 'unknown'), user_role)
            
            # Only pass current_user if the function expects it
            import inspect
            sig = inspect.signature(f)
            if 'current_user' in sig.parameters:
                return f(current_user=current_user, *args, **kwargs)
            else:
                return f(*args, **kwargs)
        return decorated_function
    return decorator


@excel_bp.route('/test', methods=['GET'])
@role_required('admin')
def test_endpoint(current_user):
    """Simple test to verify the route and auth work."""
    return jsonify({'status': 'ok', 'user': current_user.email}), 200


@excel_bp.route('/upload-preview', methods=['POST'])
@role_required('admin')
def upload_preview(current_user):
    """Upload an Excel file and return column structure + sample data from the 3 target sheets."""
    import pandas as pd
    print(f'[UPLOAD] Request received from {current_user.email}')
    print(f'[UPLOAD] Request files: {list(request.files.keys())}')
    print(f'[UPLOAD] Content-Type: {request.content_type}')

    if 'file' not in request.files:
        print('[UPLOAD] ERROR: No file in request')
        return jsonify({'error': 'Dosya bulunamadı'}), 400

    file = request.files['file']
    if not file.filename:
        return jsonify({'error': 'Dosya seçilmedi'}), 400

    print(f'[UPLOAD] File: {file.filename}, content_type: {file.content_type}')

    if not file.filename.lower().endswith(('.xlsx', '.xls', '.xlsb')):
        return jsonify({'error': 'Sadece Excel dosyaları (.xlsx, .xls, .xlsb) kabul edilir'}), 400

    # Save file temporarily
    ext = os.path.splitext(file.filename)[1].lower()
    filepath = os.path.join(UPLOAD_FOLDER, f'database_upload{ext}')
    engine = 'pyxlsb' if ext == '.xlsb' else None
    print(f'[UPLOAD] Saving to: {filepath}')
    file.save(filepath)
    print(f'[UPLOAD] File saved, size: {os.path.getsize(filepath)} bytes')

    try:
        # Read all sheet names first
        xls = pd.ExcelFile(filepath, engine=engine)
        all_sheets = xls.sheet_names

        # Check which required sheets exist
        missing_sheets = [s for s in REQUIRED_SHEETS if s not in all_sheets]

        result = {
            'allSheets': all_sheets,
            'missingSheets': missing_sheets,
            'sheets': {}
        }

        for sheet_name in REQUIRED_SHEETS:
            if sheet_name not in all_sheets:
                continue

            df = pd.read_excel(filepath, sheet_name=sheet_name, header=0, engine=engine)

            # Clean column names
            columns = [str(c).strip() for c in df.columns.tolist()]

            # Get first 5 rows as sample data
            sample_data = []
            for _, row in df.head(5).iterrows():
                row_dict = {}
                for col in columns:
                    val = row.get(col, '')
                    if pd.isna(val):
                        val = None
                    elif hasattr(val, 'isoformat'):
                        val = val.isoformat()
                    else:
                        val = str(val)
                    row_dict[col] = val
                sample_data.append(row_dict)

            result['sheets'][sheet_name] = {
                'columns': columns,
                'rowCount': len(df),
                'sampleData': sample_data,
            }

        # For DATABASE sheet, count unique IDs if an ID-like column exists
        if 'DATABASE' in result['sheets']:
            db_cols = result['sheets']['DATABASE']['columns']
            # Try to find an ID column
            id_candidates = [c for c in db_cols if 'id' in c.lower() or 'no' in c.lower() or 'sicil' in c.lower()]
            result['sheets']['DATABASE']['idCandidates'] = id_candidates

            if id_candidates:
                df_db = pd.read_excel(filepath, sheet_name='DATABASE', header=0, engine=engine)
                for id_col in id_candidates:
                    unique_count = df_db[id_col].nunique()
                    result['sheets']['DATABASE'][f'uniqueCount_{id_col}'] = int(unique_count)

            result['sheets']['DATABASE']['totalRows'] = result['sheets']['DATABASE']['rowCount']

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': f'Excel dosyası okunamadı: {str(e)}'}), 500


@excel_bp.route('/delete', methods=['DELETE'])
@role_required('admin')
def delete_excel_file(current_user):
    """Delete the uploaded Excel database file and clear database records."""
    try:
        from models.database_record import DatabaseRecord
        
        deleted = False
        
        # Delete all Excel files in UPLOAD_FOLDER
        for f in os.listdir(UPLOAD_FOLDER):
            if f.endswith(('.xlsx', '.xls', '.xlsb')):
                os.remove(os.path.join(UPLOAD_FOLDER, f))
                deleted = True
        
        # Clear database records
        # This removes the data shown on the dashboard
        try:
            num_deleted = db.session.query(DatabaseRecord).delete()
            db.session.commit()
            print(f"[DELETE] Deleted {num_deleted} records from DatabaseRecord")
        except Exception as db_e:
            db.session.rollback()
            print(f"[DELETE] Error clearing database: {db_e}")
            # Don't fail the whole request if DB clear fails, but warn?
            # actually we should probably return error if strict.
            # But file is deleted.
        
        if deleted:
            return jsonify({'success': True, 'message': 'Veritabanı dosyası ve verileri silindi'}), 200
        else:
            return jsonify({'success': False, 'message': 'Silinecek dosya bulunamadı'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@excel_bp.route('/import-all', methods=['POST'])
@role_required('admin')
def import_all_data(current_user):
    """Import Users, Employee Info, and Hourly Rates from the Excel file."""
    from models import db
    from models.user import User
    from models.employee_info import EmployeeInfo
    from models.hourly_rate import HourlyRate
    import pandas as pd

    data = request.get_json()
    id_column = data.get('idColumn')

    if not id_column:
        return jsonify({'error': 'ID sütunu seçilmedi (DATABASE sayfası için)'}), 400

    # Find the uploaded file
    filepath = None
    engine = None
    for ext in ['.xlsx', '.xls', '.xlsb']:
        candidate = os.path.join(UPLOAD_FOLDER, f'database_upload{ext}')
        if os.path.exists(candidate):
            filepath = candidate
            engine = 'pyxlsb' if ext == '.xlsb' else None
            break

    if not filepath:
        return jsonify({'error': 'Önce bir Excel dosyası yükleyin'}), 400

    stats = {
        'users': {'imported': 0, 'updated': 0, 'skipped': 0, 'errors': []},
        'database_records': {'imported': 0, 'errors': []},
        'info': {'imported': 0, 'updated': 0, 'errors': []},
        'rates': {'imported': 0, 'updated': 0, 'errors': []}
    }

    try:
        # ==========================================
        # 1. PROCESS USERS (DATABASE SHEET)
        # ==========================================
        df_db = pd.read_excel(filepath, sheet_name='DATABASE', header=0, engine=engine)
        df_db.columns = [str(c).strip() for c in df_db.columns]

        if id_column not in df_db.columns:
            return jsonify({'error': f'DATABASE sayfasında "{id_column}" sütunu bulunamadı'}), 400

        # Unique employees
        df_unique = df_db.drop_duplicates(subset=[id_column], keep='first')
        
        for _, row in df_unique.iterrows():
            person_id = str(row[id_column]).strip()
            if not person_id or person_id.lower() == 'nan':
                continue

            # Check existing
            user = User.query.filter_by(employee_id=person_id).first()
            
            # Extract names
            first_name = ''
            last_name = ''
            
            # Try to find name columns
            for col in df_db.columns:
                col_lower = col.lower()
                val = str(row[col]).strip() if pd.notna(row[col]) else ''
                if not val: continue
                
                # Skip values that are purely numeric (e.g. hourly rates like 7.0, 131.949...)
                try:
                    float(val)
                    continue  # This is a number, not a name
                except ValueError:
                    pass
                
                if any(k in col_lower for k in ['first', 'ad', 'isim']) and 'soyad' not in col_lower:
                    first_name = clean_name(val)
                elif any(k in col_lower for k in ['last', 'soyad', 'surname']):
                    last_name = clean_name(val)
            
            # Fallback to single Name column
            if not first_name and not last_name:
                for col in df_db.columns:
                    if 'name' in col.lower() or 'ad' in col.lower():
                        raw_val = str(row[col]).strip()
                        try:
                            float(raw_val)
                            continue  # Skip numeric columns
                        except ValueError:
                            pass
                        full_name = clean_name(raw_val)
                        parts = full_name.split(maxsplit=1)
                        if len(parts) >= 2:
                            first_name, last_name = parts[0], parts[1]
                        elif len(parts) == 1:
                            first_name, last_name = parts[0], '-'
                        break
            
            # Safety check: if first_name is numeric or a User_XXXXX placeholder, fix it
            if first_name:
                is_numeric = False
                try:
                    float(first_name)
                    is_numeric = True
                except ValueError:
                    pass
                import re as _re
                is_placeholder = bool(_re.match(r'^User_\S+$', first_name))
                if is_numeric or is_placeholder:
                    # last_name likely has the real full name
                    if last_name and last_name != '-':
                        parts = last_name.split(maxsplit=1)
                        first_name = parts[0]
                        last_name = parts[1] if len(parts) >= 2 else '-'
                    else:
                        first_name = f'User_{person_id}'
            
            if not first_name: first_name = f'User_{person_id}'
            if not last_name: last_name = '-'

            if user:
                # Update existing user
                try:
                    user.first_name = first_name
                    user.last_name = last_name
                    if not user.is_active:
                        user.is_active = True
                    stats['users']['updated'] += 1
                except Exception as e:
                    stats['users']['errors'].append(f'ID {person_id} (güncelleme): {str(e)}')
            else:
                try:
                    # Create new user
                    email = f'user_{person_id.lower().replace(" ", "_")}@firma.com'
                    if User.query.filter_by(email=email).first():
                        email = f'user_{person_id.lower().replace(" ", "_")}_{os.urandom(2).hex()}@firma.com'
                    
                    user = User(
                        email=email,
                        employee_id=person_id,
                        first_name=first_name,
                        last_name=last_name,
                        role='personal',
                        is_active=True
                    )
                    user.set_password('123456')  # Default password
                    db.session.add(user)
                    stats['users']['imported'] += 1
                except Exception as e:
                    stats['users']['errors'].append(f'ID {person_id}: {str(e)}')

        db.session.commit()  # Commit users so we can link info/rates

        # ==========================================
        # 1.5. IMPORT DATABASE RECORDS (All rows from DATABASE sheet)
        # ==========================================
        from models.database_record import DatabaseRecord
        import json
        
        # First, clear existing database records to avoid duplicates
        try:
            num_deleted = db.session.query(DatabaseRecord).delete()
            db.session.commit()
            print(f"[IMPORT] Cleared {num_deleted} existing database records")
        except Exception as e:
            print(f"[IMPORT] Warning: Could not clear existing records: {e}")
            db.session.rollback()
        
        # Import all rows from DATABASE sheet
        for idx, row in df_db.iterrows():
            try:
                # Find the person's name (from various possible name columns)
                person_name = None
                person_id_val = str(row[id_column]).strip() if pd.notna(row[id_column]) else None
                
                # Try to find name from columns
                for col in df_db.columns:
                    col_lower = col.lower()
                    if any(k in col_lower for k in ['name', 'ad', 'isim']) and 'id' not in col_lower:
                        val = str(row[col]).strip() if pd.notna(row[col]) else ''
                        if val and val.lower() != 'nan':
                            try:
                                float(val)
                                continue  # Skip numeric values
                            except ValueError:
                                person_name = clean_name(val)
                                break
                
                # If no name found, use the employee ID
                if not person_name and person_id_val:
                    person_name = f"User_{person_id_val}"
                
                if not person_name:
                    continue  # Skip records without identifiable person
                
                # Convert row to dictionary, handling various data types
                row_data = {}
                for col in df_db.columns:
                    val = row[col]
                    if pd.isna(val):
                        row_data[col] = None
                    elif isinstance(val, (int, float)):
                        # Keep numbers as numbers
                        row_data[col] = float(val) if val != int(val) else int(val)
                    elif hasattr(val, 'isoformat'):
                        # Convert datetime to ISO string
                        row_data[col] = val.isoformat()
                    else:
                        row_data[col] = str(val)
                
                # Create DatabaseRecord
                record = DatabaseRecord(
                    personel=person_name,
                    data=json.dumps(row_data, ensure_ascii=False)
                )
                db.session.add(record)
                stats['database_records']['imported'] += 1
                
            except Exception as e:
                stats['database_records']['errors'].append(f'Row {idx}: {str(e)}')
        
        db.session.commit()
        print(f"[IMPORT] Imported {stats['database_records']['imported']} database records")

        # ==========================================
        # 2. PROCESS INFO (Info SHEET)
        # ==========================================
        try:
            df_info = pd.read_excel(filepath, sheet_name='Info', header=0, engine=engine)
            df_info.columns = [str(c).strip() for c in df_info.columns]
            
            # Find ID column in Info sheet (usually 'ID' or 'No')
            info_id_col = next((c for c in df_info.columns if c.lower() in ['id', 'no', 'sicil no']), None)
            
            if info_id_col:
                for _, row in df_info.iterrows():
                    person_id = str(row[info_id_col]).strip()
                    if not person_id or person_id.lower() == 'nan': continue

                    # Find user
                    user = User.query.filter_by(employee_id=person_id).first()
                    user_id = user.id if user else None

                    # Upsert EmployeeInfo
                    info = EmployeeInfo.query.filter_by(employee_id=person_id).first()
                    is_new_info = False
                    if not info:
                        info = EmployeeInfo(employee_id=person_id)
                        db.session.add(info)
                        is_new_info = True
                    
                    info.user_id = user_id
                    info.company = str(row.get('Company', '')) if pd.notna(row.get('Company')) else None
                    info.nationality = str(row.get('Nationality', '')) if pd.notna(row.get('Nationality')) else None
                    info.title = str(row.get('Title', '')) if pd.notna(row.get('Title')) else None
                    info.function = str(row.get('Function', '')) if pd.notna(row.get('Function')) else None
                    info.discipline = str(row.get('Discipline', '')) if pd.notna(row.get('Discipline')) else None
                    # Use index navigation for Reporting (Column S -> index 18 approx, but use name if possible)
                    info.reporting_manager = str(row.get('Reporting', '')) if pd.notna(row.get('Reporting')) else None
                    info.projects = str(row.get('Projects', '')) if pd.notna(row.get('Projects')) else None
                    
                    if is_new_info:
                        stats['info']['imported'] += 1
                    else:
                        stats['info']['updated'] += 1

        except Exception as e:
            print(f"Info sheet error: {e}")
            stats['info']['errors'].append(str(e))

        # ==========================================
        # 3. PROCESS HOURLY RATES (Hourly Rates SHEET)
        # ==========================================
        try:
            # Read first few rows to find structure
            # Row 0 usually has Periods (merged cells), Row 1 has Columns (Currency, Rate)
            # We'll read the whole dataframe with header=1 (2nd row) to get columns
            # And read header=0 separately to get periods
            
            df_rates = pd.read_excel(filepath, sheet_name='Hourly Rates', header=1, engine=engine)
            df_periods = pd.read_excel(filepath, sheet_name='Hourly Rates', header=None, engine=engine, nrows=1)
            
            # Locate ID column in rates
            rate_id_col = next((c for c in df_rates.columns if str(c).lower() in ['id', 'no']), None)
            
            if rate_id_col:
                # Identify period blocks
                # Logic: Periods are in row 0. They span multiple columns. 
                # We iterate columns in groups (e.g. 2 or 3 columns per period)
                
                # Hardcoded offset based on shared file analysis or dynamic detection
                # Sample file showed: ID, Name, Company, Contract, Currency, 1, Hourly Base Rates 1...
                # Periods were in row 0 at index 4, 6, 8 etc.
                
                period_map = {} # col_index -> period_name
                row0 = df_periods.iloc[0]
                current_period = None
                
                for idx, val in enumerate(row0):
                    if pd.notna(val) and isinstance(val, str):
                        current_period = val
                    if current_period:
                        period_map[idx] = current_period

                for _, row in df_rates.iterrows():
                    person_id = str(row[rate_id_col]).strip()
                    if not person_id or person_id.lower() == 'nan': continue

                    user = User.query.filter_by(employee_id=person_id).first()
                    user_id = user.id if user else None
                    
                    # Iterate dynamic columns to find rates
                    # We look for columns named 'Hourly Base Rates' or similar
                    for col_name in df_rates.columns:
                        col_str = str(col_name)
                        if 'hourly' in col_str.lower() or 'rate' in col_str.lower():
                            # Find the period for this column index
                            col_idx = df_rates.columns.get_loc(col_name)
                            # Adjustment: get_loc might return array if duplicate names. Assume unique or handle index.
                            if isinstance(col_idx, int):
                                period = period_map.get(col_idx, 'Unknown Period')
                                
                                val = row[col_name]
                                if pd.notna(val) and isinstance(val, (int, float)) and val > 0:
                                    # Found a rate!
                                    # Look for currency in previous column usually
                                    currency = 'USD' # Default
                                    if col_idx > 0:
                                        prev_col = df_rates.columns[col_idx-1]
                                        prev_val = row[prev_col]
                                        if isinstance(prev_val, str) and len(prev_val) == 3:
                                            currency = prev_val
                                    
                                    # Upsert Rate
                                    rate_rec = HourlyRate.query.filter_by(
                                        employee_id=person_id, 
                                        period=period
                                    ).first()
                                    
                                    is_new_rate = False
                                    if not rate_rec:
                                        rate_rec = HourlyRate(
                                            employee_id=person_id,
                                            period=period
                                        )
                                        db.session.add(rate_rec)
                                        is_new_rate = True
                                    
                                    rate_rec.user_id = user_id
                                    rate_rec.hourly_rate = float(val)
                                    rate_rec.currency = currency
                                    
                                    if is_new_rate:
                                        stats['rates']['imported'] += 1
                                    else:
                                        stats['rates']['updated'] += 1

        except Exception as e:
            print(f"Rates sheet error: {e}")
            stats['rates']['errors'].append(str(e))

        db.session.commit()
        
        return jsonify({
            'message': 'Veri içe aktarma tamamlandı',
            'stats': stats
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Genel aktarım hatası: {str(e)}'}), 500

