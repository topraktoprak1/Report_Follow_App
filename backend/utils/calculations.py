"""
Calculation Engine - ported from Data-Analysis-Web-Application (app2).
Provides Excel-formula-equivalent calculations for auto-populating record fields.
"""

import os
import json
import re
import pandas as pd
from datetime import datetime

# ---------------------------------------------------------------------------
# Cache
# ---------------------------------------------------------------------------
_excel_cache = {
    'info_df': None,
    'hourly_rates_df': None,
    'summary_df': None,
    'file_path': None
}


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def safe_float(value, default=0.0):
    """Safely convert value to float."""
    try:
        if pd.isna(value):
            return default
        return float(value)
    except Exception:
        return default


def safe_str(value, default=''):
    """Safely convert value to string."""
    try:
        if pd.isna(value):
            return default
        result = str(value).strip()
        return result if result.lower() != 'nan' else default
    except Exception:
        return default


def excel_date_to_string(value):
    """
    Convert an Excel serial date (integer) or various date string formats to
    a normalised 'DD/Mon/YYYY' string expected by TCMB lookups.
    """
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ''
    try:
        # If it's already a string, try to parse it
        if isinstance(value, str):
            s = value.strip()
            if not s or s.lower() in ('nan', 'none', 'nat'):
                return ''
            # Already looks like DD/Mon/YYYY
            if re.match(r'\d{1,2}/[A-Za-z]{3}/\d{4}', s):
                return s
            # Try other common formats
            for fmt in ('%Y-%m-%d', '%d.%m.%Y', '%d/%m/%Y', '%Y/%m/%d',
                        '%d-%m-%Y', '%m/%d/%Y'):
                try:
                    dt = datetime.strptime(s[:10], fmt)
                    return dt.strftime('%d/%b/%Y')
                except Exception:
                    continue
            return s  # Return as-is if no format matched
        # Numeric Excel serial date
        if isinstance(value, (int, float)):
            epoch = datetime(1899, 12, 30)
            dt = epoch + pd.Timedelta(days=int(value))
            return dt.strftime('%d/%b/%Y')
        # pandas Timestamp
        if hasattr(value, 'strftime'):
            return value.strftime('%d/%b/%Y')
    except Exception:
        pass
    return str(value)


def xlookup(lookup_value, lookup_array, return_array, if_not_found=0):
    """Python equivalent of Excel XLOOKUP."""
    try:
        if not isinstance(lookup_array, pd.Series):
            lookup_array = pd.Series(lookup_array)
        if not isinstance(return_array, pd.Series):
            return_array = pd.Series(return_array)

        if pd.isna(lookup_value):
            return if_not_found

        mask = lookup_array == lookup_value

        # Normalised string fallback
        if not mask.any() and isinstance(lookup_value, str):
            try:
                norm_lv = ' '.join(str(lookup_value).strip().upper().split())
                norm_arr = lookup_array.astype(str).str.strip().str.upper().apply(
                    lambda x: ' '.join(x.split()))
                mask = norm_arr == norm_lv
            except Exception:
                pass

        if mask.any():
            idx = mask.idxmax()
            result = (return_array.iloc[idx] if isinstance(return_array, pd.Series)
                      else return_array[idx])
            return result if pd.notna(result) else if_not_found

        return if_not_found
    except Exception as e:
        print(f'[CALC] xlookup error: {e}')
        return if_not_found


def find_column(df, *possible_names):
    """Return the first column name in possible_names that exists in df, else None."""
    for name in possible_names:
        if name in df.columns:
            return name
    return None


def set_if_empty(df, idx, col, value, debug=False):
    """Write *value* into df.at[idx, col] only when the cell is currently empty/NaN."""
    if col is None:
        return False
    current = df.at[idx, col]
    is_empty = (current is None or
                (isinstance(current, float) and pd.isna(current)) or
                (isinstance(current, str) and current.strip() == ''))
    if is_empty:
        df.at[idx, col] = value
        return True
    return False


# ---------------------------------------------------------------------------
# Reference data loader
# ---------------------------------------------------------------------------

def load_excel_reference_data(file_path=None, upload_dir=None):
    """
    Load Info, Hourly Rates and Summary sheets from the Excel file into cache.
    Returns True on success, False on failure.
    """
    global _excel_cache

    if upload_dir is None:
        upload_dir = os.path.join(os.path.dirname(__file__), '..', 'uploads')

    if file_path is None:
        candidates = [f for f in os.listdir(upload_dir)
                      if f.lower().endswith(('.xlsb', '.xlsx', '.xls'))]
        if not candidates:
            return False
        candidates.sort(reverse=True)
        file_path = os.path.join(upload_dir, candidates[0])

    # Use cache if same file
    if _excel_cache['file_path'] == file_path and _excel_cache['info_df'] is not None:
        return True

    try:
        ext = os.path.splitext(file_path)[1].lower()
        engine = 'pyxlsb' if ext == '.xlsb' else None

        # Info sheet
        df_info = pd.read_excel(file_path, sheet_name='Info',
                                engine=engine) if engine else pd.read_excel(
            file_path, sheet_name='Info')

        # Normalise the Weeks/Month column (index 20) from Excel serial dates
        if len(df_info.columns) > 20:
            df_info.iloc[:, 20] = df_info.iloc[:, 20].apply(excel_date_to_string)

        _excel_cache['info_df'] = df_info

        # Hourly Rates sheet (header on row 2)
        df_rates = (pd.read_excel(file_path, sheet_name='Hourly Rates',
                                  engine=engine, header=1)
                    if engine else
                    pd.read_excel(file_path, sheet_name='Hourly Rates', header=1))
        _excel_cache['hourly_rates_df'] = df_rates

        # Summary sheet (optional)
        try:
            df_summary = (pd.read_excel(file_path, sheet_name='Summary', engine=engine)
                          if engine else
                          pd.read_excel(file_path, sheet_name='Summary'))
            _excel_cache['summary_df'] = df_summary
        except Exception:
            _excel_cache['summary_df'] = None

        _excel_cache['file_path'] = file_path
        print(f'[CALC] Loaded Excel reference data from {os.path.basename(file_path)}')
        return True
    except Exception as e:
        print(f'[CALC] Failed to load Excel reference data: {e}')
        return False


def invalidate_cache():
    """Clear the in-memory reference data cache (call after a new file upload)."""
    global _excel_cache
    _excel_cache = {
        'info_df': None,
        'hourly_rates_df': None,
        'summary_df': None,
        'file_path': None
    }


# ---------------------------------------------------------------------------
# Per-record auto-calculation
# ---------------------------------------------------------------------------

def calculate_auto_fields(record_data, file_path=None, upload_dir=None):
    """
    Calculate all auto-populated fields for a single record dict.

    Returns:
        (updated_record_data, list_of_na_fields)
    """
    if not load_excel_reference_data(file_path, upload_dir):
        print('[CALC] Warning: Could not load Excel reference data')
        return record_data, []

    info_df  = _excel_cache['info_df']
    rates_df = _excel_cache['hourly_rates_df']
    summary_df = _excel_cache['summary_df']

    na_fields = []

    # ---- input extraction ------------------------------------------------
    person_id   = safe_float(record_data.get('ID', 0))
    scope       = safe_str(record_data.get('Scope', ''))
    company     = safe_str(record_data.get('Company', ''))
    projects    = safe_str(record_data.get('Projects', ''))
    projects_group = safe_str(record_data.get('Projects/Group', ''))
    nationality    = safe_str(record_data.get('Nationality', ''))

    week_month_raw = (record_data.get('(Week /\nMonth)', '') or
                      record_data.get('(Week / Month)', '') or
                      record_data.get('Week / Month', '') or
                      record_data.get('Week/Month', ''))
    week_month = excel_date_to_string(week_month_raw) if week_month_raw else ''

    total_mh      = safe_float(record_data.get('TOTAL\n MH', 0) or
                               record_data.get('TOTAL MH', 0) or
                               record_data.get('Total MH', 0))
    kuzey_mh_person = safe_float(record_data.get('Kuzey MH-Person', 0))

    isveren_currency = safe_str(record_data.get('İşveren - Currency', ''))

    # ---- FORMULA 1: North/South ------------------------------------------
    north_south = xlookup(scope, info_df.iloc[:, 13], info_df.iloc[:, 16], '')
    record_data['North/\nSouth'] = north_south
    record_data['North/South']   = north_south
    record_data['North/ South']  = north_south

    # ---- FORMULA 2: Currency ---------------------------------------------
    if person_id == 905264:
        currency = 'TL'
    else:
        currency = xlookup(person_id, rates_df.iloc[:, 0], rates_df.iloc[:, 6], 'USD')
    record_data['Currency'] = currency

    # ---- FORMULA 3: Projects/Group (only if user hasn't provided one) ----
    if not projects_group:
        projects_group = xlookup(projects, info_df.iloc[:, 14], info_df.iloc[:, 15], '')
        record_data['Projects/Group'] = projects_group

    # ---- FORMULA 4: AP-CB/Subcon ----------------------------------------
    ap_cb_subcon = 'AP-CB' if 'AP-CB' in company else 'Subcon'
    record_data['AP-CB /\nSubcon'] = ap_cb_subcon

    # ---- FORMULA 5: LS/Unit Rate ----------------------------------------
    scope_has_lumpsum  = 'lumpsum' in scope.lower() if scope else False
    company_is_special = company in ['İ4', 'DEGENKOLB', 'Kilci Danışmanlık']
    ls_unit_rate = 'Lumpsum' if (scope_has_lumpsum or company_is_special) else 'Unit Rate'
    record_data['LS/Unit Rate'] = ls_unit_rate

    # ---- FORMULA 6: Hourly Base Rate ------------------------------------
    if ap_cb_subcon == 'Subcon' and ls_unit_rate == 'Unit Rate':
        hourly_base_rate = safe_float(xlookup(person_id, rates_df.iloc[:, 0], rates_df.iloc[:, 9], 0))
    else:
        hourly_base_rate = safe_float(xlookup(person_id, rates_df.iloc[:, 0], rates_df.iloc[:, 7], 0))
    record_data['Hourly Base Rate'] = hourly_base_rate

    # ---- FORMULA 7: Hourly Additional Rate ------------------------------
    if ls_unit_rate == 'Lumpsum' or company in ('AP-CB', 'AP-CB / pergel'):
        hourly_additional_rate = 0
    else:
        additional_base = safe_float(xlookup(person_id, rates_df.iloc[:, 0], rates_df.iloc[:, 11], 0))
        currency_norm = safe_str(currency).strip().upper()
        if currency_norm == 'USD':
            hourly_additional_rate = additional_base
        elif currency_norm == 'TL':
            tcmb = safe_float(xlookup(week_month, info_df.iloc[:, 20], info_df.iloc[:, 22], 1))
            hourly_additional_rate = additional_base * tcmb
        else:
            hourly_additional_rate = 0
    record_data['Hourly Additional Rates'] = hourly_additional_rate

    # ---- FORMULA 8: Hourly Rate ----------------------------------------
    hourly_rate = hourly_base_rate + hourly_additional_rate
    record_data['Hourly\n Rate'] = hourly_rate
    record_data['Hourly Rate']   = hourly_rate

    # ---- FORMULA 9: Cost -----------------------------------------------
    cost = hourly_rate * total_mh
    record_data['Cost'] = cost

    # ---- FORMULA 10: General Total Cost (USD) --------------------------
    currency_norm = safe_str(currency).strip().upper()
    if currency_norm == 'TL':
        tcmb_usd_try = safe_float(xlookup(week_month, info_df.iloc[:, 20], info_df.iloc[:, 22], 1))
        general_total_cost_usd = cost / tcmb_usd_try if tcmb_usd_try != 0 else 0
    elif currency_norm == 'EURO':
        tcmb_eur_usd = safe_float(xlookup(week_month, info_df.iloc[:, 20], info_df.iloc[:, 23], 1))
        general_total_cost_usd = cost * tcmb_eur_usd
    else:
        general_total_cost_usd = cost
    record_data['General Total\n Cost (USD)'] = general_total_cost_usd
    record_data['General Total Cost (USD)']   = general_total_cost_usd

    # ---- FORMULA 11: Hourly Unit Rate (USD) ----------------------------
    hourly_unit_rate_usd = general_total_cost_usd / total_mh if total_mh != 0 else 0
    record_data['Hourly Unit Rate (USD)'] = hourly_unit_rate_usd

    # ---- NO-1..NO-10 lookups -------------------------------------------
    no_1  = xlookup(scope, info_df.iloc[:, 13], info_df.iloc[:, 9],  0)
    no_2  = xlookup(scope, info_df.iloc[:, 13], info_df.iloc[:, 11], '')
    no_3  = xlookup(scope, info_df.iloc[:, 13], info_df.iloc[:, 12], '')
    no_10 = xlookup(no_1,  info_df.iloc[:, 9],  info_df.iloc[:, 10], '')
    record_data['NO-1']  = no_1
    record_data['NO-2']  = no_2
    record_data['NO-3']  = no_3
    record_data['NO-10'] = no_10

    # ---- FORMULA 12: İşveren Hakediş Birim Fiyat ------------------------
    no_1_num = safe_float(no_1, 0)
    no_2_str = safe_str(no_2, '')

    if no_2_str in ('999-A', '999-C', '414-C') or no_1_num == 313:
        isveren_birim_fiyat = hourly_rate
    elif no_1_num in (312, 314, 316) or no_2_str == '360-T':
        isveren_birim_fiyat = hourly_rate * 1.02
    elif no_2_str == '517-A':
        isveren_birim_fiyat = safe_float(xlookup(person_id, info_df.iloc[:, 28], info_df.iloc[:, 33], 0))
    else:
        if summary_df is not None:
            v1 = safe_float(xlookup(no_1, summary_df.iloc[:, 2], summary_df.iloc[:, 26], 0))
            v2 = safe_float(xlookup(no_2, summary_df.iloc[:, 2], summary_df.iloc[:, 26], 0))
            isveren_birim_fiyat = v1 + v2
        else:
            isveren_birim_fiyat = 0
    record_data['İşveren-Hakediş Birim Fiyat'] = isveren_birim_fiyat

    # ---- FORMULA 13: İşveren-Hakediş ------------------------------------
    isveren_hakedis = (kuzey_mh_person * isveren_birim_fiyat
                       if kuzey_mh_person > 0
                       else isveren_birim_fiyat * total_mh)
    record_data['İşveren- Hakediş'] = isveren_hakedis

    # ---- FORMULA 14: İşveren- Hakediş (USD) ----------------------------
    if isveren_currency == 'EURO':
        eur_usd = safe_float(xlookup(week_month, info_df.iloc[:, 20], info_df.iloc[:, 23], 1))
        isveren_hakedis_usd = isveren_hakedis * eur_usd
    else:
        isveren_hakedis_usd = isveren_hakedis
    record_data['İşveren- Hakediş (USD)'] = isveren_hakedis_usd

    # ---- FORMULA 15: İşveren- Hakediş Birim Fiyat (USD) ----------------
    denom = kuzey_mh_person if kuzey_mh_person > 0 else total_mh
    record_data['İşveren-Hakediş Birim Fiyat\n(USD)'] = (
        isveren_hakedis_usd / denom if denom != 0 else 0)

    # ---- Control & TM fields -------------------------------------------
    control_1 = xlookup(projects, info_df.iloc[:, 14], info_df.iloc[:, 18], '')
    record_data['Control-1'] = control_1

    try:
        tm_liste = xlookup(person_id, info_df.iloc[:, 58], info_df.iloc[:, 60], '')
    except Exception:
        tm_liste = ''
    record_data['TM Liste'] = tm_liste

    tm_kod = xlookup(projects, info_df.iloc[:, 14], info_df.iloc[:, 17], '')
    record_data['TM Kod'] = tm_kod

    kontrol_1 = xlookup(projects, info_df.iloc[:, 14], info_df.iloc[:, 9], '')
    record_data['Konrol-1'] = kontrol_1
    record_data['Knrtol-2'] = bool(no_1 == kontrol_1)

    # ---- N/A tracking --------------------------------------------------
    for fname, fval in {
        'North/South': north_south,
        'Currency': currency,
        'Control-1': control_1,
        'TM Liste': tm_liste,
        'TM Kod': tm_kod,
        'Konrol-1': kontrol_1,
        'NO-1': no_1,
        'NO-2': no_2,
        'NO-3': no_3,
        'NO-10': no_10,
    }.items():
        if not fval or fval == 'N/A':
            na_fields.append(fname)

    return record_data, na_fields


# ---------------------------------------------------------------------------
# Bulk fill-empty-cells for DataFrame rows
# ---------------------------------------------------------------------------

def fill_empty_cells_with_formulas(df, info_df, rates_df, summary_df):
    """
    Fill empty calculated columns in a DATABASE-sheet DataFrame using the
    same formulas as calculate_auto_fields.
    Only writes to cells that are currently empty/NaN (non-destructive).
    """
    result_df = df.copy()

    # Discover column names
    col = lambda *names: find_column(result_df, *names)
    col_north_south       = col('North/South', 'North/\nSouth', 'North/ South')
    col_currency          = col('Currency')
    col_ap_cb_subcon      = col('AP-CB / \nSubcon', 'AP-CB/Subcon', 'AP-CB / Subcon',
                                'AP-CB/\nSubcon', 'APCB/Subcon')
    col_ls_unit_rate      = col('LS/Unit Rate')
    col_hourly_base_rate  = col('Hourly Base Rate')
    col_hourly_add_rate   = col('Hourly Additional Rates', 'Hourly Additional Rate')
    col_hourly_rate       = col('Hourly Rate', 'Hourly\n Rate')
    col_cost              = col('Cost')
    col_gen_cost_usd      = col('General Total Cost (USD)', 'General Total\n Cost (USD)')
    col_hur_unit_usd      = col('Hourly Unit Rate (USD)')
    col_no_1  = col('NO-1')
    col_no_2  = col('NO-2')
    col_no_3  = col('NO-3')
    col_no_10 = col('NO-10')
    col_isv_birim       = col('İşveren-Hakediş Birim Fiyat')
    col_isv_hakedis     = col('İşveren- Hakediş')
    col_isv_hakedis_usd = col('İşveren- Hakediş (USD)')
    col_isv_birim_usd   = col('İşveren-Hakediş Birim Fiyat\n(USD)',
                               'İşveren-Hakediş Birim Fiyat (USD)')
    col_ctrl1    = col('Control-1')
    col_tm_liste = col('TM Liste')
    col_tm_kod   = col('TM Kod')
    col_kontrol1 = col('Konrol-1', 'Kontrol-1')
    col_kontrol2 = col('Knrtol-2', 'Kontrol-2')

    print(f'[CALC] Filling empty cells for {len(result_df)} rows …')

    for idx, row in result_df.iterrows():
        person_id = safe_float(row.get('ID', 0))
        scope     = safe_str(row.get('Scope', ''))
        company   = safe_str(row.get('Company', ''))
        projects  = safe_str(row.get('Projects', ''))
        isveren_currency = safe_str(row.get('İşveren - Currency', '') or
                                    row.get('İşveren-Currency', ''))

        week_month_raw = (row.get('(Week / Month)', '') or
                          row.get('(Week /\nMonth)', '') or
                          row.get('Week / Month', '') or
                          row.get('Week/Month', ''))
        week_month = excel_date_to_string(week_month_raw) if week_month_raw else ''

        total_mh        = safe_float(row.get('TOTAL MH', 0) or
                                     row.get('TOTAL\n MH', 0) or
                                     row.get('Total MH', 0))
        kuzey_mh_person = safe_float(row.get('Kuzey MH-Person', 0))

        # 1. North/South
        if col_north_south:
            set_if_empty(result_df, idx, col_north_south,
                         xlookup(scope, info_df.iloc[:, 13], info_df.iloc[:, 16], ''))

        # 2. Currency
        currency = ('TL' if person_id == 905264 else
                    xlookup(person_id, rates_df.iloc[:, 0], rates_df.iloc[:, 6], 'USD'))
        if col_currency:
            set_if_empty(result_df, idx, col_currency, currency)
        currency = safe_str(result_df.at[idx, col_currency], 'USD') if col_currency else currency

        # 3. AP-CB/Subcon
        ap_cb_subcon = 'AP-CB' if 'AP-CB' in company.upper() else 'Subcon'
        if col_ap_cb_subcon:
            set_if_empty(result_df, idx, col_ap_cb_subcon, ap_cb_subcon)
        ap_cb_subcon = safe_str(result_df.at[idx, col_ap_cb_subcon], ap_cb_subcon) if col_ap_cb_subcon else ap_cb_subcon

        # 4. LS/Unit Rate
        lumpsum = ('lumpsum' in scope.lower() if scope else False) or company in ('İ4', 'DEGENKOLB', 'Kilci Danışmanlık')
        ls_unit_rate = 'Lumpsum' if lumpsum else 'Unit Rate'
        if col_ls_unit_rate:
            set_if_empty(result_df, idx, col_ls_unit_rate, ls_unit_rate)
        ls_unit_rate = safe_str(result_df.at[idx, col_ls_unit_rate], ls_unit_rate) if col_ls_unit_rate else ls_unit_rate

        # 5. Hourly Base Rate
        if ap_cb_subcon == 'Subcon' and ls_unit_rate == 'Unit Rate':
            hourly_base_rate = safe_float(xlookup(person_id, rates_df.iloc[:, 0], rates_df.iloc[:, 9], 0))
        else:
            hourly_base_rate = safe_float(xlookup(person_id, rates_df.iloc[:, 0], rates_df.iloc[:, 7], 0))
        if col_hourly_base_rate:
            set_if_empty(result_df, idx, col_hourly_base_rate, hourly_base_rate)

        # 6. Hourly Additional Rate
        if ls_unit_rate == 'Lumpsum' or company in ('AP-CB', 'AP-CB / pergel'):
            hourly_add_rate = 0
        else:
            add_base = safe_float(xlookup(person_id, rates_df.iloc[:, 0], rates_df.iloc[:, 11], 0))
            c_norm = currency.strip().upper()
            if c_norm == 'USD':
                hourly_add_rate = add_base
            elif c_norm == 'TL':
                tcmb = safe_float(xlookup(week_month, info_df.iloc[:, 20], info_df.iloc[:, 22], 1))
                hourly_add_rate = add_base * tcmb
            else:
                hourly_add_rate = 0
        if col_hourly_add_rate:
            set_if_empty(result_df, idx, col_hourly_add_rate, hourly_add_rate)

        # 7. Hourly Rate
        hourly_rate = hourly_base_rate + hourly_add_rate
        if col_hourly_rate:
            set_if_empty(result_df, idx, col_hourly_rate, hourly_rate)

        # 8. Cost
        cost = hourly_rate * total_mh
        if col_cost:
            set_if_empty(result_df, idx, col_cost, cost)

        # 9. General Total Cost (USD)
        c_norm = currency.strip().upper()
        if c_norm == 'TL':
            r = safe_float(xlookup(week_month, info_df.iloc[:, 20], info_df.iloc[:, 22], 1))
            gen_cost_usd = cost / r if r else 0
        elif c_norm == 'EURO':
            r = safe_float(xlookup(week_month, info_df.iloc[:, 20], info_df.iloc[:, 23], 1))
            gen_cost_usd = cost * r
        else:
            gen_cost_usd = cost
        if col_gen_cost_usd:
            set_if_empty(result_df, idx, col_gen_cost_usd, gen_cost_usd)

        # 10. Hourly Unit Rate (USD)
        if col_hur_unit_usd:
            set_if_empty(result_df, idx, col_hur_unit_usd,
                         gen_cost_usd / total_mh if total_mh else 0)

        # NO lookups
        no_1  = xlookup(scope, info_df.iloc[:, 13], info_df.iloc[:, 9],  0)
        no_2  = xlookup(scope, info_df.iloc[:, 13], info_df.iloc[:, 11], '')
        no_3  = xlookup(scope, info_df.iloc[:, 13], info_df.iloc[:, 12], '')
        no_10 = xlookup(no_1,  info_df.iloc[:, 9],  info_df.iloc[:, 10], '')
        if col_no_1:  set_if_empty(result_df, idx, col_no_1,  no_1)
        if col_no_2:  set_if_empty(result_df, idx, col_no_2,  no_2)
        if col_no_3:  set_if_empty(result_df, idx, col_no_3,  no_3)
        if col_no_10: set_if_empty(result_df, idx, col_no_10, no_10)

        # İşveren birim fiyat
        n1 = safe_float(no_1, 0)
        n2 = safe_str(no_2, '')
        if n2 in ('999-A', '999-C', '414-C') or n1 == 313:
            isv_birim = hourly_rate
        elif n1 in (312, 314, 316) or n2 == '360-T':
            isv_birim = hourly_rate * 1.02
        elif n2 == '517-A':
            isv_birim = safe_float(xlookup(person_id, info_df.iloc[:, 28], info_df.iloc[:, 33], 0))
        else:
            if summary_df is not None:
                isv_birim = (safe_float(xlookup(no_1, summary_df.iloc[:, 2], summary_df.iloc[:, 26], 0)) +
                             safe_float(xlookup(no_2, summary_df.iloc[:, 2], summary_df.iloc[:, 26], 0)))
            else:
                isv_birim = 0
        if col_isv_birim:
            set_if_empty(result_df, idx, col_isv_birim, isv_birim)

        isv_hakedis = kuzey_mh_person * isv_birim if kuzey_mh_person > 0 else isv_birim * total_mh
        if col_isv_hakedis:
            set_if_empty(result_df, idx, col_isv_hakedis, isv_hakedis)

        if isveren_currency == 'EURO':
            eur_r = safe_float(xlookup(week_month, info_df.iloc[:, 20], info_df.iloc[:, 23], 1))
            isv_hakedis_usd = isv_hakedis * eur_r
        else:
            isv_hakedis_usd = isv_hakedis
        if col_isv_hakedis_usd:
            set_if_empty(result_df, idx, col_isv_hakedis_usd, isv_hakedis_usd)

        denom = kuzey_mh_person if kuzey_mh_person > 0 else total_mh
        if col_isv_birim_usd:
            set_if_empty(result_df, idx, col_isv_birim_usd,
                         isv_hakedis_usd / denom if denom else 0)

        # Control/TM
        if col_ctrl1:
            set_if_empty(result_df, idx, col_ctrl1,
                         xlookup(projects, info_df.iloc[:, 14], info_df.iloc[:, 18], ''))
        if col_tm_liste:
            try:
                set_if_empty(result_df, idx, col_tm_liste,
                             xlookup(person_id, info_df.iloc[:, 58], info_df.iloc[:, 60], ''))
            except Exception:
                pass
        if col_tm_kod:
            set_if_empty(result_df, idx, col_tm_kod,
                         xlookup(projects, info_df.iloc[:, 14], info_df.iloc[:, 17], ''))

        if col_kontrol1:
            k1 = xlookup(projects, info_df.iloc[:, 14], info_df.iloc[:, 9], '')
            set_if_empty(result_df, idx, col_kontrol1, k1)
        else:
            k1 = ''

        if col_kontrol2:
            k2 = 'TRUE' if no_1 == k1 else 'FALSE'
            cur_k2 = result_df.at[idx, col_kontrol2]
            if (pd.isna(cur_k2) or cur_k2 in (0, 0.0, 1, 1.0) or
                    (isinstance(cur_k2, str) and cur_k2.strip() == '')):
                if result_df[col_kontrol2].dtype in ('float64', 'int64'):
                    result_df[col_kontrol2] = result_df[col_kontrol2].astype(object)
                result_df.at[idx, col_kontrol2] = k2

    print(f'[CALC] Finished filling empty cells.')
    return result_df
