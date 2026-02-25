"""
Analytics Blueprint - powered by the calculation engine from app2.
Provides advanced filtering, MH analysis, KAR-ZARAR trends and fill-empty-cells.
"""

from flask import Blueprint, jsonify, request, session
import json
import os
import re
import pandas as pd
from datetime import datetime
from werkzeug.utils import secure_filename

from models import db
from models.database_record import DatabaseRecord
from middleware.auth_middleware import role_required
from utils.calculations import (
    load_excel_reference_data, calculate_auto_fields, fill_empty_cells_with_formulas,
    safe_float, safe_str, excel_date_to_string, invalidate_cache, _excel_cache
)

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _load_all_records():
    """Return a list of parsed JSON dicts from DatabaseRecord."""
    rows = DatabaseRecord.query.all()
    out = []
    for r in rows:
        try:
            out.append(json.loads(r.data))
        except Exception:
            continue
    return out


def _get_field(record, *names):
    """Return the first matching field value from a record dict."""
    for n in names:
        v = record.get(n)
        if v is not None and str(v).strip() not in ('', 'nan', 'None', 'NaT'):
            return str(v).strip()
    return ''


FILTER_FIELD_MAP = {
    'nameSurname':   ['Name Surname', 'nameSurname'],
    'discipline':    ['Discipline', 'discipline'],
    'company':       ['Company', 'company'],
    'projectsGroup': ['Projects/Group', 'projectsGroup'],
    'scope':         ['Scope', 'scope'],
    'projects':      ['Projects', 'projects'],
    'nationality':   ['Nationality', 'nationality'],
    'status':        ['Status', 'status'],
    'northSouth':    ['North/South', 'North/ South', 'North/\nSouth'],
    'control1':      ['Control-1'],
    'no1':           ['NO-1'],
    'no2':           ['NO-2'],
    'no3':           ['NO-3'],
    'no10':          ['NO-10'],
    'kontrol1':      ['Konrol-1', 'Kontrol-1'],
    'kontrol2':      ['Knrtol-2', 'Kontrol-2'],
    'lsUnitRate':    ['LS/Unit Rate'],
}


def _apply_filters(data, filters):
    """Filter a list of record dicts according to a {key: [values]} dict."""
    result = []
    for rec in data:
        ok = True
        for key, values in filters.items():
            if not values:
                continue
            field_names = FILTER_FIELD_MAP.get(key, [key])
            rec_val = _get_field(rec, *field_names).upper()
            if rec_val not in [str(v).strip().upper() for v in values if v]:
                ok = False
                break
        if ok:
            result.append(rec)
    return result


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@analytics_bp.route('/filter-options', methods=['GET'])
@role_required('admin', 'project_manager', 'team_leader', 'hr', 'personal')
def get_filter_options(current_user):
    """Return cascading filter options based on currently active filters."""
    try:
        filters = json.loads(request.args.get('filters', '{}'))
        data = _apply_filters(_load_all_records(), filters)

        def unique_opts(*field_names):
            vals = set()
            for rec in data:
                v = _get_field(rec, *field_names)
                if v:
                    vals.add(v)
            return [{'label': v, 'value': v} for v in sorted(vals)]

        options = {k: unique_opts(*v) for k, v in FILTER_FIELD_MAP.items()}
        return jsonify(options)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/filter', methods=['POST'])
@role_required('admin', 'project_manager', 'team_leader', 'hr', 'personal')
def filter_records(current_user):
    """Return records matching the posted filter dict."""
    try:
        filters = request.get_json(force=True).get('filters', {})
        data = _apply_filters(_load_all_records(), filters)
        return jsonify({'success': True, 'data': data, 'count': len(data)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/mh-summary', methods=['GET'])
@role_required('admin', 'project_manager', 'team_leader', 'hr', 'personal')
def get_mh_summary(current_user):
    """MH table: aggregate TOTAL MH by person × month, with optional filters."""
    try:
        year    = request.args.get('year', '') or None
        month   = request.args.get('month', '') or None
        filters = json.loads(request.args.get('filters', '{}'))

        data = _apply_filters(_load_all_records(), filters)

        def parse_month_year(date_str):
            if not date_str:
                return None, None
            for fmt in ('%d/%b/%Y', '%d/%B/%Y', '%Y-%m-%d', '%Y/%m/%d',
                        '%d.%m.%Y', '%m/%d/%Y'):
                try:
                    dt = datetime.strptime(str(date_str)[:11].strip(), fmt)
                    return dt.month, dt.year
                except Exception:
                    continue
            try:
                dt = pd.to_datetime(date_str)
                if pd.notna(dt):
                    return dt.month, dt.year
            except Exception:
                pass
            return None, None

        person_data = {}
        for rec in data:
            name = _get_field(rec, 'Name Surname', 'nameSurname') or 'Unknown'
            mh   = safe_float(rec.get('TOTAL MH') or rec.get('TOTAL\n MH') or
                               rec.get('Total MH') or 0)
            date_str = _get_field(rec, '(Week / Month)', 'Week / Month', 'Date', 'Tarih')
            rec_month, rec_year = parse_month_year(date_str)

            if name not in person_data:
                person_data[name] = {
                    'nameSurname': name,
                    'discipline': _get_field(rec, 'Discipline'),
                    'company':    _get_field(rec, 'Company'),
                    'projectsGroup': _get_field(rec, 'Projects/Group'),
                    'monthlyMH': {},
                    'totalMH': 0,
                }

            if rec_month and rec_year:
                if not year or str(rec_year) == year:
                    mk = str(rec_month).zfill(2)
                    if not month or mk == month:
                        key = f'{rec_year}-{mk}' if not year else mk
                        person_data[name]['monthlyMH'][key] = (
                            person_data[name]['monthlyMH'].get(key, 0) + mh)
                        person_data[name]['totalMH'] += mh
            elif not year and not month:
                person_data[name]['totalMH'] += mh

        return jsonify({'data': list(person_data.values())})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/kar-zarar-trends', methods=['GET'])
@role_required('admin', 'project_manager', 'team_leader', 'hr', 'personal')
def get_kar_zarar_trends(current_user):
    """
    Monthly KAR-ZARAR (= İşveren Hakediş USD - General Total Cost USD) or
    TOTAL MH trends, grouped by a chosen dimension.
    """
    try:
        dimension = request.args.get('dimension', 'projects')
        year      = request.args.get('year', '') or None
        metric    = request.args.get('metric', 'karZarar')  # karZarar | totalMH

        field_map = {
            'nameSurname':   ['Name Surname'],
            'discipline':    ['Discipline'],
            'projectsGroup': ['Projects/Group'],
            'scope':         ['Scope'],
            'projects':      ['Projects'],
            'company':       ['Company'],
            'northSouth':    ['North/South', 'North/ South'],
            'lsUnitRate':    ['LS/Unit Rate'],
        }
        dim_fields = field_map.get(dimension, ['Projects'])

        data = _load_all_records()
        agg = {}

        for rec in data:
            dim_val = _get_field(rec, *dim_fields)
            if not dim_val:
                continue

            if metric == 'totalMH':
                value = safe_float(rec.get('TOTAL MH') or rec.get('TOTAL\n MH') or 0)
                if value <= 0:
                    continue
            else:
                actual = safe_float(rec.get('İşveren- Hakediş (USD)') or
                                    rec.get('İşveren- Hakediş') or 0)
                cost   = safe_float(rec.get('General Total Cost (USD)') or
                                    rec.get('General Total\n Cost (USD)') or 0)
                if actual == 0 and cost == 0:
                    continue
                value = actual - cost

            date_str = _get_field(rec, '(Week / Month)', 'Date', 'Tarih')
            if not date_str:
                continue

            rec_year, rec_month = None, None
            for fmt in ('%d/%b/%Y', '%d/%B/%Y', '%Y-%m-%d', '%Y/%m/%d', '%m/%d/%Y'):
                try:
                    dt = datetime.strptime(date_str[:11].strip(), fmt)
                    rec_year, rec_month = dt.year, dt.month
                    break
                except Exception:
                    pass
            if not rec_year:
                m = re.search(r'(\d{4})', date_str)
                if m:
                    rec_year = int(m.group(1))
                    rec_month = 1

            if not rec_year or not rec_month:
                continue
            if year and str(rec_year) != year:
                continue

            month_key = f'{rec_year}-{str(rec_month).zfill(2)}'
            bucket = agg.setdefault(dim_val, {})
            bucket[month_key] = bucket.get(month_key, 0) + value

        result = []
        for dim_val, monthly in agg.items():
            sorted_months = sorted(monthly.keys())
            result.append({
                'name': dim_val,
                'data': [{'month': mk, 'value': monthly[mk]} for mk in sorted_months],
            })
        result.sort(key=lambda x: sum(d['value'] for d in x['data']), reverse=True)

        return jsonify({'data': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/total-mh-pie', methods=['GET'])
@role_required('admin', 'project_manager', 'team_leader', 'hr', 'personal')
def get_total_mh_pie(current_user):
    """Return TOTAL MH aggregated by a dimension, for pie/bar charts."""
    try:
        dimension = request.args.get('dimension', 'projects')
        year      = request.args.get('year', '') or None

        field_map = {
            'projects':      ['Projects'],
            'discipline':    ['Discipline'],
            'company':       ['Company'],
            'projectsGroup': ['Projects/Group'],
            'northSouth':    ['North/South', 'North/ South'],
            'lsUnitRate':    ['LS/Unit Rate'],
            'nameSurname':   ['Name Surname'],
        }
        dim_fields = field_map.get(dimension, ['Projects'])

        data = _load_all_records()
        agg = {}

        for rec in data:
            dim_val = _get_field(rec, *dim_fields) or 'Other'
            mh = safe_float(rec.get('TOTAL MH') or rec.get('TOTAL\n MH') or 0)
            if mh <= 0:
                continue

            if year:
                date_str = _get_field(rec, '(Week / Month)', 'Date', 'Tarih')
                m = re.search(r'(\d{4})', date_str)
                if not m or m.group(1) != year:
                    continue

            agg[dim_val] = agg.get(dim_val, 0) + mh

        colors = ['#00d4ff', '#8b5cf6', '#0cdba8', '#f59e0b', '#ef4444',
                  '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#a855f7']
        result = [
            {'name': k, 'value': round(v, 1), 'color': colors[i % len(colors)]}
            for i, (k, v) in enumerate(
                sorted(agg.items(), key=lambda x: x[1], reverse=True))
        ]

        return jsonify({'data': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/apcb-pie', methods=['GET'])
@role_required('admin', 'project_manager', 'team_leader', 'hr', 'personal')
def get_apcb_pie(current_user):
    """AP-CB vs Subcon counts."""
    try:
        data = _load_all_records()
        apcb   = sum(1 for r in data if 'AP-CB'  in _get_field(r, 'AP-CB /\nSubcon', 'AP-CB / Subcon', 'AP-CB/Subcon'))
        subcon = sum(1 for r in data if 'Subcon' in _get_field(r, 'AP-CB /\nSubcon', 'AP-CB / Subcon', 'AP-CB/Subcon'))
        return jsonify({'apcb': apcb, 'subcon': subcon})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/recalculate', methods=['POST'])
@role_required('admin')
def recalculate_all(current_user):
    """
    Re-run calculate_auto_fields on every DatabaseRecord.
    Useful after a new reference Excel is uploaded.
    """
    try:
        invalidate_cache()
        records = DatabaseRecord.query.all()
        updated = 0
        errors  = []

        for r in records:
            try:
                data = json.loads(r.data)
                data, _ = calculate_auto_fields(data, upload_dir=UPLOAD_DIR)
                r.data = json.dumps(data, ensure_ascii=False, default=str)
                updated += 1
            except Exception as e:
                errors.append(f'Record {r.id}: {str(e)}')

        db.session.commit()
        return jsonify({
            'success': True,
            'updated': updated,
            'errors': errors,
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/fill-empty-cells', methods=['POST'])
@role_required('admin')
def fill_empty_cells(current_user):
    """
    Upload a DATABASE-sheet Excel, fill empty calculated columns, return download URL.
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in ('.xlsx', '.xls', '.xlsb'):
            return jsonify({'error': 'Invalid file type. Allowed: .xlsx .xls .xlsb'}), 400

        ts       = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'{ts}_{secure_filename(file.filename)}'
        filepath = os.path.join(UPLOAD_DIR, filename)
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        file.save(filepath)

        engine = 'pyxlsb' if ext == '.xlsb' else None
        df_db = (pd.read_excel(filepath, sheet_name='DATABASE', engine=engine)
                 if engine else pd.read_excel(filepath, sheet_name='DATABASE'))

        if not load_excel_reference_data(upload_dir=UPLOAD_DIR):
            return jsonify({'error': 'Could not load reference sheets. '
                            'Please upload the full Excel file (with Info/Hourly Rates/Summary sheets) first.'}), 400

        info_df    = _excel_cache['info_df']
        rates_df   = _excel_cache['hourly_rates_df']
        summary_df = _excel_cache['summary_df']

        df_filled  = fill_empty_cells_with_formulas(df_db, info_df, rates_df, summary_df)

        out_name = f'filled_{ts}_{os.path.basename(file.filename)}'
        if ext == '.xlsb':
            out_name = out_name.replace('.xlsb', '.xlsx')
        out_path = os.path.join(UPLOAD_DIR, out_name)
        df_filled.to_excel(out_path, sheet_name='DATABASE', index=False)

        return jsonify({
            'success': True,
            'message': f'{df_filled.shape[0]} rows processed.',
            'rows': int(df_filled.shape[0]),
            'columns': int(df_filled.shape[1]),
            'download_url': f'/api/analytics/download/{out_name}',
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@analytics_bp.route('/download/<filename>', methods=['GET'])
@role_required('admin')
def download_filled(filename, current_user):
    """Serve a processed Excel file."""
    from flask import send_file
    path = os.path.join(UPLOAD_DIR, secure_filename(filename))
    if not os.path.exists(path):
        return jsonify({'error': 'File not found'}), 404
    return send_file(path, as_attachment=True, download_name=filename)
