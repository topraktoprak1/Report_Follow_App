"""
Standalone VBA reader for Microsoft Access .accdb / .mdb files.

Run as a subprocess:
    python access_vba_reader.py <path_to_accdb>

Outputs a JSON array of module objects to stdout.
Errors are written to stderr.
Must run on Windows with Microsoft Access installed.
"""

import sys
import json
import re

def extract_vba(file_path: str):
    modules = []

    # Initialise COM in STA mode (required for Access.Application)
    try:
        import pythoncom
        pythoncom.CoInitialize()
    except ImportError:
        pass  # pywin32 not available → will fail below

    access_app = None
    try:
        import win32com.client

        access_app = win32com.client.DispatchEx("Access.Application")
        # Do NOT set Visible before OpenCurrentDatabase — causes DAO ref error.
        # OpenCurrentDatabase(path, Exclusive=False)
        access_app.OpenCurrentDatabase(file_path, False)

        vbe = access_app.VBE
        for proj_idx in range(1, vbe.VBProjects.Count + 1):
            proj = vbe.VBProjects.Item(proj_idx)
            for comp_idx in range(1, proj.VBComponents.Count + 1):
                comp = proj.VBComponents.Item(comp_idx)
                try:
                    cm = comp.CodeModule
                    count = cm.CountOfLines
                    if count > 0:
                        code = cm.Lines(1, count)
                        modules.append({
                            'name': comp.Name,
                            'code': code,
                        })
                except Exception:
                    pass

    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
    finally:
        if access_app is not None:
            try:
                access_app.CloseCurrentDatabase()
            except Exception:
                pass
            try:
                access_app.Quit()
            except Exception:
                pass

        try:
            import pythoncom
            pythoncom.CoUninitialize()
        except Exception:
            pass

    print(json.dumps(modules, ensure_ascii=False))


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python access_vba_reader.py <path>", file=sys.stderr)
        sys.exit(1)
    extract_vba(sys.argv[1])
