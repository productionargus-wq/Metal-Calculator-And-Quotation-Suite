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

// Copy .env and package.json
if (fs.existsSync(path.join(ROOT, '.env'))) {
  fs.copyFileSync(path.join(ROOT, '.env'), path.join(APP_PAYLOAD_DIR, '.env'));
}
fs.copyFileSync(path.join(ROOT, 'package.json'), path.join(APP_PAYLOAD_DIR, 'package.json'));

// 4. Copy node.exe
console.log('4. Copying node runtime binary...');
const systemNodeExe = process.execPath;
fs.copyFileSync(systemNodeExe, path.join(APP_PAYLOAD_DIR, 'node.exe'));

// Write version tag
fs.writeFileSync(path.join(APP_PAYLOAD_DIR, 'version.txt'), '7.5.0-desktop', 'utf8');

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
                string expectedVersion = "7.5.0-desktop";

                bool needsExtract = !Directory.Exists(appDir) ||
                                    !File.Exists(versionFile) ||
                                    File.ReadAllText(versionFile).Trim() != expectedVersion;

                if (needsExtract)
                {
                    if (Directory.Exists(appDir))
                    {
                        try { Directory.Delete(appDir, true); } catch { }
                    }
                    Directory.CreateDirectory(appDir);

                    using (Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("payload.zip"))
                    {
                        if (stream == null)
                        {
                            MessageBox.Show("Error: Embedded application payload not found.", "Argus Quotation Suite", MessageBoxButtons.OK, MessageBoxIcon.Error);
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

                int port = 3000;
                string serverUrl = "http://localhost:" + port + "/";
                bool serverAlreadyRunning = IsServerResponding(serverUrl + "api/health", 600);

                Process nodeProcess = null;
                if (!serverAlreadyRunning)
                {
                    string nodeExe = Path.Combine(appDir, "node.exe");
                    string bundleJs = Path.Combine(appDir, "bundle.js");

                    if (!File.Exists(nodeExe) || !File.Exists(bundleJs))
                    {
                        MessageBox.Show("Error: Core runtime files missing in " + appDir, "Argus Quotation Suite", MessageBoxButtons.OK, MessageBoxIcon.Error);
                        return;
                    }

                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = nodeExe;
                    psi.Arguments = "\\"" + bundleJs + "\\"";
                    psi.WorkingDirectory = appDir;
                    psi.CreateNoWindow = true;
                    psi.UseShellExecute = false;
                    psi.WindowStyle = ProcessWindowStyle.Hidden;

                    nodeProcess = Process.Start(psi);

                    int waitMs = 0;
                    bool ready = false;
                    while (waitMs < 20000)
                    {
                        Thread.Sleep(300);
                        waitMs += 300;
                        if (IsServerResponding(serverUrl, 400))
                        {
                            ready = true;
                            break;
                        }
                    }

                    if (!ready)
                    {
                        MessageBox.Show("Server start timeout. Please check your internet connection.", "Argus Quotation Suite", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    }
                }

                string edgePath = FindEdge();
                Process browserProcess = null;

                if (!string.IsNullOrEmpty(edgePath))
                {
                    ProcessStartInfo edgePsi = new ProcessStartInfo();
                    edgePsi.FileName = edgePath;
                    edgePsi.Arguments = "--app=" + serverUrl + " --new-window";
                    edgePsi.UseShellExecute = false;
                    browserProcess = Process.Start(edgePsi);
                }
                else
                {
                    Process.Start(serverUrl);
                }

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
                MessageBox.Show("Launch error: " + ex.Message, "Argus Quotation Suite", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        static bool IsServerResponding(string url, int timeoutMs)
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(url);
                req.Timeout = timeoutMs;
                req.Method = "GET";
                using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
                {
                    return (int)res.StatusCode < 500;
                }
            }
            catch
            {
                return false;
            }
        }

        static string FindEdge()
        {
            string p86 = @"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
            if (File.Exists(p86)) return p86;

            string p64 = @"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe";
            if (File.Exists(p64)) return p64;

            string local = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), @"Microsoft\\Edge\\Application\\msedge.exe");
            if (File.Exists(local)) return local;

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

const exeSizeMB = (fs.statSync(FINAL_EXE).size / (1024 * 1024)).toFixed(2);
console.log('========================================================');
console.log('SUCCESS! Standalone Executable Generated:');
console.log(`Path: ${FINAL_EXE}`);
console.log(`File Size: ${exeSizeMB} MB`);
console.log('100% Standalone: Single-file, 0% Python dependency, ready to send via WhatsApp!');
console.log('========================================================');
