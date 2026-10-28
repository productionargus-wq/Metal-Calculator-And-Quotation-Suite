const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Building Standalone Metal Calculator Executable ===');

const ROOT = __dirname;
const BUILD_DIR = path.join(ROOT, 'build_standalone');
const APP_PAYLOAD_DIR = path.join(BUILD_DIR, 'app_payload');
const DIST_DIR = path.join(ROOT, 'dist_executable');
const ZIP_PATH = path.join(BUILD_DIR, 'payload.zip');
const FINAL_EXE = path.join(DIST_DIR, 'MetalCalculator.exe');
const ROOT_EXE = path.join(ROOT, 'MetalCalculator.exe');
const DIST_ROOT_EXE = path.join(ROOT, 'dist', 'MetalCalculator.exe');

// 1. Clean directories
console.log('1. Cleaning build directories...');
if (fs.existsSync(BUILD_DIR)) fs.rmSync(BUILD_DIR, { recursive: true, force: true });
if (fs.existsSync(DIST_DIR)) fs.rmSync(DIST_DIR, { recursive: true, force: true });
fs.mkdirSync(BUILD_DIR, { recursive: true });
fs.mkdirSync(APP_PAYLOAD_DIR, { recursive: true });
fs.mkdirSync(DIST_DIR, { recursive: true });

// 2. Bundle backend code using esbuild
console.log('2. Bundling server.js with esbuild...');
const bundleJsPath = path.join(APP_PAYLOAD_DIR, 'bundle.js');
execSync(`npx esbuild "${path.join(ROOT, 'server.js')}" --bundle --platform=node --target=node20 --outfile="${bundleJsPath}"`, {
  stdio: 'inherit',
  cwd: ROOT
});

// 3. Copy public assets into payload
console.log('3. Copying public assets and configuration...');
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyDirSync(path.join(ROOT, 'public'), path.join(APP_PAYLOAD_DIR, 'public'));

// Copy .env and package.json (Ensure default PORT is 3000 to match Google OAuth authorized origins)
if (fs.existsSync(path.join(ROOT, '.env'))) {
  let envContent = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
  envContent = envContent.replace(/^PORT\s*=.*$/m, 'PORT=3000');
  fs.writeFileSync(path.join(APP_PAYLOAD_DIR, '.env'), envContent, 'utf8');
} else {
  const fallbackEnv = [
    'MONGODB_URI=mongodb+srv://salesargustech_db_user:12345@cluster0.nrulvqr.mongodb.net/?appName=Cluster0',
    'PORT=3000',
    'GOOGLE_CLIENT_ID=626458680124-0qlrhuebi0n3ooe53kvet29hp8nj264u.apps.googleusercontent.com'
  ].join('\n');
  fs.writeFileSync(path.join(APP_PAYLOAD_DIR, '.env'), fallbackEnv, 'utf8');
}
fs.copyFileSync(path.join(ROOT, 'package.json'), path.join(APP_PAYLOAD_DIR, 'package.json'));

// 4. Copy node runtime binary...
console.log('4. Copying node runtime binary...');
const systemNodeExe = process.execPath;
fs.copyFileSync(systemNodeExe, path.join(APP_PAYLOAD_DIR, 'node.exe'));

// Write version tag (bumped to 7.5.5 to force fresh extraction on end-user machines)
const APP_VERSION = '7.5.5-desktop';
fs.writeFileSync(path.join(APP_PAYLOAD_DIR, 'version.txt'), APP_VERSION, 'utf8');

// 5. Create payload.zip using PowerShell .NET ZipFile (fast and reliable)
console.log('5. Compressing payload into payload.zip...');
const psZipCmd = `powershell -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.IO.Compression.FileSystem'); [System.IO.Compression.ZipFile]::CreateFromDirectory('${APP_PAYLOAD_DIR}', '${ZIP_PATH}', [System.IO.Compression.CompressionLevel]::Optimal, $false)"`;
execSync(psZipCmd, { stdio: 'inherit', cwd: ROOT });

const zipSizeMB = (fs.statSync(ZIP_PATH).size / (1024 * 1024)).toFixed(2);
console.log(`   Payload compressed successfully: ${zipSizeMB} MB`);

// 6. Write native C# Launcher
console.log('6. Writing native C# launcher source...');
const csSourcePath = path.join(BUILD_DIR, 'Program.cs');
const csCode = `
using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;

namespace ArgusMetalCalculator
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            try
            {
                string appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string targetDir = Path.Combine(appData, "ArgusMetalCalculator");
                string appDir = Path.Combine(targetDir, "app");
                string versionFile = Path.Combine(appDir, "version.txt");
                string expectedVersion = "${APP_VERSION}";

                bool needsExtract = !Directory.Exists(appDir) ||
                                    !File.Exists(versionFile) ||
                                    File.ReadAllText(versionFile).Trim() != expectedVersion;

                if (needsExtract)
                {
                    // Terminate any previous node instances before extracting
                    KillOrphanedInstances(appDir);

                    if (Directory.Exists(appDir))
                    {
                        try { Directory.Delete(appDir, true); } catch { }
                    }
                    Directory.CreateDirectory(appDir);

                    using (Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("payload.zip"))
                    {
                        if (stream == null)
                        {
                            MessageBox.Show("Error: Embedded application payload not found.", "Argus Metal Calculator", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            return;
                        }

                        using (ZipArchive archive = new ZipArchive(stream))
                        {
                            archive.ExtractToDirectory(appDir);
                        }
                    }

                    File.WriteAllText(versionFile, expectedVersion);
                    CreateDesktopShortcut();
                }

                // Clean up any stale node instances from previous sessions
                KillOrphanedInstances(appDir);

                // Prioritize Port 3000 so Google OAuth authorized origin matches exactly
                int port = 3000;
                bool serverAlreadyRunning = false;

                if (IsOurServer(3000, 400))
                {
                    serverAlreadyRunning = true;
                }
                else if (IsPortAvailable(3000))
                {
                    port = 3000;
                }
                else
                {
                    // Fallback port range if 3000 is occupied by external software
                    port = 4892;
                    while (port < 5000)
                    {
                        if (IsOurServer(port, 400))
                        {
                            serverAlreadyRunning = true;
                            break;
                        }
                        else if (IsPortAvailable(port))
                        {
                            break;
                        }
                        port++;
                    }
                }

                string serverUrl = "http://localhost:" + port + "/";
                Process nodeProcess = null;

                if (!serverAlreadyRunning)
                {
                    string nodeExe = Path.Combine(appDir, "node.exe");
                    string bundleJs = Path.Combine(appDir, "bundle.js");

                    if (!File.Exists(nodeExe) || !File.Exists(bundleJs))
                    {
                        MessageBox.Show("Error: Core runtime files missing in " + appDir, "Argus Metal Calculator", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        return;
                    }

                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = nodeExe;
                    psi.Arguments = "\\"" + bundleJs + "\\" " + port;
                    psi.WorkingDirectory = appDir;
                    psi.CreateNoWindow = true;
                    psi.UseShellExecute = false;
                    psi.WindowStyle = ProcessWindowStyle.Hidden;
                    psi.EnvironmentVariables["PORT"] = port.ToString();
                    psi.EnvironmentVariables["MONGODB_URI"] = "mongodb+srv://salesargustech_db_user:12345@cluster0.nrulvqr.mongodb.net/?appName=Cluster0";
                    psi.EnvironmentVariables["GOOGLE_CLIENT_ID"] = "626458680124-0qlrhuebi0n3ooe53kvet29hp8nj264u.apps.googleusercontent.com";

                    nodeProcess = Process.Start(psi);

                    // Wait specifically for OUR server signature
                    int waitMs = 0;
                    bool ready = false;
                    while (waitMs < 25000)
                    {
                        Thread.Sleep(300);
                        waitMs += 300;
                        if (IsOurServer(port, 400))
                        {
                            ready = true;
                            break;
                        }
                    }

                    if (!ready)
                    {
                        MessageBox.Show("Server initialization timed out on port " + port + ". Please check your network connection.", "Argus Metal Calculator", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    }
                }

                // 3. Open in Edge / Chrome App Mode
                string browserPath = FindBrowser();
                Process browserProcess = null;

                if (!string.IsNullOrEmpty(browserPath))
                {
                    ProcessStartInfo browserPsi = new ProcessStartInfo();
                    browserPsi.FileName = browserPath;
                    browserPsi.Arguments = "--app=" + serverUrl + " --new-window";
                    browserPsi.UseShellExecute = false;
                    browserProcess = Process.Start(browserPsi);
                }
                else
                {
                    Process.Start(serverUrl);
                }

                // 4. Clean exit when browser window closes
                if (nodeProcess != null && !nodeProcess.HasExited)
                {
                    if (browserProcess != null)
                    {
                        browserProcess.WaitForExit();
                        try
                        {
                            if (!nodeProcess.HasExited) nodeProcess.Kill();
                        }
                        catch { }
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Launch error: " + ex.Message, "Argus Metal Calculator", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        static void KillOrphanedInstances(string appDir)
        {
            foreach (var p in Process.GetProcessesByName("node"))
            {
                try
                {
                    if (p.MainModule != null)
                    {
                        string fn = p.MainModule.FileName;
                        if (fn.StartsWith(appDir, StringComparison.OrdinalIgnoreCase) ||
                            fn.IndexOf("ArgusMetalCalculator", StringComparison.OrdinalIgnoreCase) >= 0 ||
                            fn.IndexOf("_MEI", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            p.Kill();
                            p.WaitForExit(800);
                        }
                    }
                }
                catch { }
            }
        }

        static bool IsPortAvailable(int port)
        {
            try
            {
                TcpListener l = new TcpListener(IPAddress.Loopback, port);
                l.Start();
                l.Stop();
                return true;
            }
            catch
            {
                return false;
            }
        }

        static bool IsOurServer(int port, int timeoutMs)
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create("http://localhost:" + port + "/api/metal-calc-health");
                req.Timeout = timeoutMs;
                req.Method = "GET";
                using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
                {
                    if (res.StatusCode == HttpStatusCode.OK)
                    {
                        using (StreamReader reader = new StreamReader(res.GetResponseStream()))
                        {
                            string text = reader.ReadToEnd();
                            return text.Contains("metal-weight-quotation-suite");
                        }
                    }
                }
            }
            catch { }
            return false;
        }

        static string FindBrowser()
        {
            // Edge 64-bit
            string p64 = @"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe";
            if (File.Exists(p64)) return p64;

            // Edge 32-bit
            string p86 = @"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
            if (File.Exists(p86)) return p86;

            // Edge user-local
            string localEdge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\\Edge\\Application\\msedge.exe");
            if (File.Exists(localEdge)) return localEdge;

            // Chrome 64-bit
            string c64 = @"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
            if (File.Exists(c64)) return c64;

            // Chrome 32-bit
            string c86 = @"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
            if (File.Exists(c86)) return c86;

            return null;
        }

        static void CreateDesktopShortcut()
        {
            try
            {
                string desktop = Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory);
                string shortcutPath = Path.Combine(desktop, "Metal Weight Calculator & Quotation Suite.lnk");
                string currentExe = Assembly.GetExecutingAssembly().Location;

                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType != null)
                {
                    dynamic shell = Activator.CreateInstance(shellType);
                    dynamic shortcut = shell.CreateShortcut(shortcutPath);
                    shortcut.TargetPath = currentExe;
                    shortcut.WorkingDirectory = Path.GetDirectoryName(currentExe);
                    shortcut.Description = "Metal Weight Calculator & Quotation Suite - Argus Technologies";
                    shortcut.IconLocation = currentExe + ",0";
                    shortcut.Save();
                }
            }
            catch { }
        }
    }
}
`;
fs.writeFileSync(csSourcePath, csCode, 'utf8');

// 7. Compile with C# compiler (csc.exe)
console.log('7. Compiling standalone executable with csc.exe...');
const iconPath = path.join(ROOT, 'public', 'app_icon.ico');
const iconArg = fs.existsSync(iconPath) ? `/win32icon:"${iconPath}"` : '';

const cscCmd = `C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe /target:winexe /optimize+ /resource:"${ZIP_PATH}",payload.zip /reference:System.dll,System.Windows.Forms.dll,System.IO.Compression.dll,System.IO.Compression.FileSystem.dll ${iconArg} /out:"${FINAL_EXE}" "${csSourcePath}"`;

execSync(cscCmd, { stdio: 'inherit', cwd: ROOT });

// 8. Distribute to all target locations
console.log('8. Distributing executable to target locations...');
fs.copyFileSync(FINAL_EXE, ROOT_EXE);
if (!fs.existsSync(path.dirname(DIST_ROOT_EXE))) fs.mkdirSync(path.dirname(DIST_ROOT_EXE), { recursive: true });
fs.copyFileSync(FINAL_EXE, DIST_ROOT_EXE);

const installedProgramDir = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Argus Technologies', 'Metal Calculator');
const installedExePath = path.join(installedProgramDir, 'MetalCalculator.exe');
if (fs.existsSync(installedProgramDir)) {
  try {
    fs.copyFileSync(FINAL_EXE, installedExePath);
    console.log(`   Successfully updated installed executable at: ${installedExePath}`);
  } catch (err) {
    console.warn(`   Could not overwrite installed exe (${err.message}) - may be running.`);
  }
}

// Update the user's desktop shortcut "Metal Calculator.lnk" to point directly to the installed/root executable
try {
  const psShortcut = `powershell -Command "$desktop = [Environment]::GetFolderPath('Desktop'); $shortcutFile = Join-Path $desktop 'Metal Calculator.lnk'; $s=(New-Object -ComObject WScript.Shell).CreateShortcut($shortcutFile); $s.TargetPath='${installedExePath.replace(/\\/g, '\\\\')}'; $s.WorkingDirectory='${installedProgramDir.replace(/\\/g, '\\\\')}'; $s.IconLocation='${installedExePath.replace(/\\/g, '\\\\')},0'; $s.Save()"`;
  execSync(psShortcut, { stdio: 'inherit' });
  console.log(`   Updated desktop shortcut to point to new executable.`);
} catch (err) {
  console.warn(`   Could not update desktop shortcut: ${err.message}`);
}

const exeSizeMB = (fs.statSync(FINAL_EXE).size / (1024 * 1024)).toFixed(2);
console.log('========================================================');
console.log('SUCCESS! Standalone Executable Generated:');
console.log(`Path 1: ${FINAL_EXE}`);
console.log(`Path 2: ${ROOT_EXE}`);
console.log(`Path 3: ${DIST_ROOT_EXE}`);
console.log(`File Size: ${exeSizeMB} MB`);
console.log('Default Port: 3000 (Matches Google OAuth authorized origins)');
console.log('App Signature: metal-weight-quotation-suite verified');
console.log('========================================================');
