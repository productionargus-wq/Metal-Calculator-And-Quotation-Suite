# -*- mode: python ; coding: utf-8 -*-
import os
import sys
import shutil
from PyInstaller.utils.hooks import collect_all

is_win = sys.platform == 'win32'
is_mac = sys.platform == 'darwin'
python_dir = os.path.dirname(sys.executable)

# 1. Collect Data Files (Only add files that actually exist to prevent CI runner crashes)
datas = []
if os.path.exists('public'):
    datas.append(('public', 'public'))

if os.path.exists('backend_bundle.js'):
    datas.append(('backend_bundle.js', '.'))
elif os.path.exists('server.js'):
    datas.append(('server.js', '.'))

# Optional environment templates (never mandatory)
if os.path.exists('.env'):
    datas.append(('.env', '.'))
elif os.path.exists('.env.example'):
    datas.append(('.env.example', '.'))

# 2. Collect Binaries (Node.js runtime & System DLLs)
binaries = []

# Locate Node.js executable
sys_node = shutil.which('node')
if sys_node and os.path.exists(sys_node):
    binaries.append((sys_node, '.'))
elif is_win:
    for np in [r'C:\Program Files\nodejs\node.exe', r'C:\Program Files (x86)\nodejs\node.exe']:
        if os.path.exists(np):
            binaries.append((np, '.'))
            break
elif is_mac:
    for np in ['/usr/local/bin/node', '/opt/homebrew/bin/node']:
        if os.path.exists(np):
            binaries.append((np, '.'))
            break

# Windows VC++ and Python core runtime DLLs
if is_win:
    core_dlls = ['python3.dll', 'python312.dll', 'vcruntime140.dll', 'vcruntime140_1.dll']
    for dll in core_dlls:
        dll_path = os.path.join(python_dir, dll)
        if os.path.exists(dll_path):
            binaries.append((dll_path, '.'))

    sys32 = os.path.join(os.environ.get('SystemRoot', 'C:\\Windows'), 'System32')
    for sys_dll in ['msvcp140.dll', 'msvcp140_1.dll', 'msvcp140_2.dll', 'ucrtbase.dll']:
        dll_path = os.path.join(sys32, sys_dll)
        if os.path.exists(dll_path):
            binaries.append((dll_path, '.'))

# 3. Collect Hidden Imports and Platform Dependencies
hiddenimports = ['webview']

# pywebview package data
try:
    tmp_datas, tmp_binaries, tmp_hidden = collect_all('webview')
    datas += tmp_datas
    binaries += tmp_binaries
    hiddenimports += tmp_hidden
except Exception:
    pass

if is_win:
    hiddenimports += ['clr_loader', 'pythonnet']
    try:
        tmp_datas, tmp_binaries, tmp_hidden = collect_all('clr_loader')
        datas += tmp_datas
        binaries += tmp_binaries
        hiddenimports += tmp_hidden
    except Exception:
        pass
    try:
        tmp_datas, tmp_binaries, tmp_hidden = collect_all('pythonnet')
        datas += tmp_datas
        binaries += tmp_binaries
        hiddenimports += tmp_hidden
    except Exception:
        pass
elif is_mac:
    hiddenimports += ['objc', 'WebKit', 'Foundation', 'AppKit']

# 4. Icon Resolution
win_icon = 'public/app_icon.ico' if (is_win and os.path.exists('public/app_icon.ico')) else None
mac_icon = 'public/app_icon.icns' if (is_mac and os.path.exists('public/app_icon.icns')) else None
exe_icon = win_icon if is_win else mac_icon

# 5. Analysis
a = Analysis(
    ['desktop_app.py'],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        'matplotlib', 'scipy', 'torch', 'tensorflow', 'cv2', 'PIL', 'pandas', 'numpy', 
        'IPython', 'jupyter', 'tensorboard', 'django', 'flask', 'fastapi', 'selenium',
        'spacy', 'nltk', 'fitz', 'docx', 'openpyxl', 'pydantic', 'sqlalchemy'
    ],
    noarchive=False,
    optimize=0,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='MetalCalculator',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=[exe_icon] if exe_icon else None,
)

if is_mac:
    app = BUNDLE(
        exe,
        name='MetalCalculator.app',
        icon=mac_icon,
        bundle_identifier='com.argustechnologies.metalcalculator',
        info_plist={
            'CFBundleName': 'Metal Calculator',
            'CFBundleDisplayName': 'Metal Weight Calculator & Quotation Suite',
            'CFBundleIdentifier': 'com.argustechnologies.metalcalculator',
            'CFBundleVersion': '1.0.0',
            'CFBundleShortVersionString': '1.0.0',
            'NSHighResolutionCapable': 'True',
            'LSMinimumSystemVersion': '10.13.0',
        }
    )
