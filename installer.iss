; Inno Setup Script for Metal Weight Calculator & Quotation Suite
; Generates Windows Setup Wizard Installer (.exe)

#define MyAppName "Metal Weight Calculator & Quotation Suite"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Argus Technologies"
#define MyAppURL "https://arguscnc.com"
#define MyAppExeName "MetalCalculator.exe"

[Setup]
; App Metadata
AppId={{E68A86C1-6B18-4E84-88A1-B33D81E8C965}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} v{#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; Installation Paths
DefaultDirName={autopf}\Argus Technologies\Metal Calculator
DefaultGroupName=Argus Metal Calculator
DisableProgramGroupPage=yes
OutputDir=dist
OutputBaseFilename=MetalCalculator_Setup
SetupIconFile=public\app_icon.ico
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern

; Execution Privileges
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog

; Output Details
VersionInfoVersion={#MyAppVersion}
VersionInfoCompany={#MyAppPublisher}
VersionInfoDescription=Metal Weight Calculator & Quotation Suite Installer
VersionInfoCopyright=Copyright (C) 2026 Argus Technologies

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: checkedonce

[Files]
Source: "dist\MetalCalculator.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "public\app_icon.ico"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app_icon.ico"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Metal Calculator"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\app_icon.ico"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
