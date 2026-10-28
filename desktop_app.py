import sys
import os
import time
import subprocess
import atexit
import urllib.request
import urllib.error
import json
import socket
import webview

# Enable native file downloads in webview
try:
    webview.settings['ALLOW_DOWNLOADS'] = True
except Exception:
    pass

# Windows EdgeChromium protocol guard
if sys.platform == 'win32':
    try:
        import webview.platforms.edgechromium as ec
        _orig_on_new_window = ec.EdgeChrome.on_new_window_request
        def _safe_on_new_window(self, sender, args):
            try:
                uri = str(args.get_Uri()) if (args and hasattr(args, 'get_Uri')) else ''
                if uri.startswith('blob:'):
                    args.set_Handled(True)
                    return
                # Allow Google OAuth and GIS popups to stay inside WebView2 so window.opener and postMessage work
                if 'accounts.google.com' in uri or 'google.com/gsi' in uri or 'oauth' in uri.lower():
                    args.set_Handled(False)
                    return
            except Exception:
                pass
            return _orig_on_new_window(self, sender, args)
        ec.EdgeChrome.on_new_window_request = _safe_on_new_window
    except Exception:
        pass

def show_alert(title, message, is_error=True):
    """ Cross-platform desktop alert dialog """
    print(f"[{title}] {message}", file=sys.stderr if is_error else sys.stdout)
    if sys.platform == 'win32':
        try:
            import ctypes
            flags = 0x10 if is_error else 0x30
            ctypes.windll.user32.MessageBoxW(0, message, title, flags)
            return
        except Exception:
            pass
    elif sys.platform == 'darwin':
        try:
            safe_msg = message.replace('"', '\\"')
            safe_title = title.replace('"', '\\"')
            cmd = f'display dialog "{safe_msg}" with title "{safe_title}" buttons {{"OK"}} default button "OK"'
            subprocess.run(['osascript', '-e', cmd], capture_output=True)
            return
        except Exception:
            pass

def get_asset_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller bundles """
    if hasattr(sys, '_MEIPASS'):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)

node_process = None

def cleanup_node():
    global node_process
    if node_process and node_process.poll() is None:
        try:
            node_process.terminate()
            node_process.wait(timeout=2)
        except Exception:
            try:
                node_process.kill()
            except Exception:
                pass
        node_process = None

atexit.register(cleanup_node)

def kill_orphaned_nodes():
    """ Terminate stale orphaned background node instances from previous sessions """
    try:
        if sys.platform == 'win32':
            subprocess.run(
                ['powershell', '-Command', 
                 'Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*Temp*_MEI*" -or $_.Path -like "*Argus*" } | Stop-Process -Force -ErrorAction SilentlyContinue'],
                creationflags=subprocess.CREATE_NO_WINDOW,
                capture_output=True,
                timeout=4
            )
    except Exception:
        pass

def is_our_server(url, timeout=0.8):
    try:
        req = urllib.request.Request(f"{url}/api/metal-calc-health")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode('utf-8'))
                return data.get('app') == 'metal-weight-quotation-suite'
    except Exception:
        return False
    return False

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex(('127.0.0.1', port)) == 0

def find_available_port(start_port=3000, max_attempts=50):
    for port in range(start_port, start_port + max_attempts):
        target_url = f"http://localhost:{port}"
        if is_our_server(target_url, timeout=0.4):
            return port, True
        if not is_port_in_use(port):
            return port, False
    return start_port, False

def start_backend():
    global node_process

    # Clean up any lingering node instances from previous sessions
    kill_orphaned_nodes()

    port, already_running = find_available_port(start_port=3000, max_attempts=50)
    target_url = f"http://localhost:{port}"

    if already_running:
        print(f"[Desktop Launcher] Backend is already running at {target_url}.")
        return target_url

    # Find Node runtime binary
    node_bin = None
    node_name = 'node.exe' if sys.platform == 'win32' else 'node'
    bundled_node = get_asset_path(node_name)
    if os.path.exists(bundled_node):
        node_bin = bundled_node
    else:
        import shutil
        node_bin = shutil.which('node') or 'node'

    # Find backend entry file
    bundled_js = get_asset_path('backend_bundle.js')
    if not os.path.exists(bundled_js):
        bundled_js = get_asset_path('server.js')

    if not os.path.exists(bundled_js):
        show_alert("Startup Error", f"Cannot find backend application file at:\n{bundled_js}", is_error=True)
        return None

    env = os.environ.copy()
    env['PORT'] = str(port)
    if 'MONGODB_URI' not in env and 'MONGO_URI' not in env:
        env['MONGODB_URI'] = 'mongodb+srv://salesargustech_db_user:12345@cluster0.nrulvqr.mongodb.net/?appName=Cluster0'
    if 'GOOGLE_CLIENT_ID' not in env:
        env['GOOGLE_CLIENT_ID'] = '626458680124-0qlrhuebi0n3ooe53kvet29hp8nj264u.apps.googleusercontent.com'

    popen_kwargs = {
        'cwd': os.path.dirname(os.path.abspath(bundled_js)),
        'env': env
    }
    if sys.platform == 'win32':
        popen_kwargs['creationflags'] = subprocess.CREATE_NO_WINDOW

    try:
        node_process = subprocess.Popen(
            [node_bin, bundled_js, str(port)],
            **popen_kwargs
        )
    except Exception as e:
        show_alert("Launch Error", f"Failed to launch Node backend runtime: {str(e)}", is_error=True)
        return None

    # Wait for backend health check
    max_wait_seconds = 25
    start_time = time.time()
    ready = False

    while time.time() - start_time < max_wait_seconds:
        if node_process.poll() is not None:
            show_alert("Launch Error", "Backend process terminated unexpectedly during startup.", is_error=True)
            return None

        if is_our_server(target_url, timeout=0.8):
            ready = True
            break
        time.sleep(0.4)

    if not ready:
        show_alert("Launch Error", f"Backend server initialization timed out on port {port}.", is_error=True)
        cleanup_node()
        return None

    return target_url

def main():
    target_url = start_backend()
    if not target_url:
        return

    # Determine platform-compatible window icon
    icon_file = None
    if sys.platform == 'win32':
        candidate = get_asset_path(os.path.join('public', 'app_icon.ico'))
        if os.path.exists(candidate):
            icon_file = candidate
    elif sys.platform == 'darwin':
        candidate = get_asset_path(os.path.join('public', 'app_icon.icns'))
        if os.path.exists(candidate):
            icon_file = candidate

    window = webview.create_window(
        title='Metal Weight Calculator & Quotation Suite',
        url=target_url,
        width=1380,
        height=860,
        min_size=(960, 600),
        text_select=True,
        zoomable=True,
        confirm_close=False
    )

    window.events.closed += cleanup_node

    webview.start(
        icon=icon_file,
        private_mode=False
    )

    cleanup_node()

if __name__ == '__main__':
    main()
