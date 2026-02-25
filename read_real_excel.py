import pandas as pd
import sys

filepath = 'DATABASE 2026 W06 R1.xlsb'
engine = 'pyxlsb'

try:
    xls = pd.ExcelFile(filepath, engine=engine)
    print(f"SHEETS: {xls.sheet_names}")

    required_sheets = ['DATABASE', 'Info', 'Hourly Rates']
    
    for s in required_sheets:
        if s in xls.sheet_names:
            df = pd.read_excel(xls, s, engine=engine)
            print(f"\n=== {s} ===")
            print(f"Columns ({len(df.columns)}): {list(df.columns)}")
            print(f"Rows: {len(df)}")
            print("Sample (first 3 rows):")
            print(df.head(3).to_string())
        else:
            print(f"\nWARNING: Sheet '{s}' not found!")

except Exception as e:
    print(f"Error: {e}")

sys.exit(0)
