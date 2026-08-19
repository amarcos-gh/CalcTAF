#define MyAppName "CalcTAF Web"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "CalcTAF"
#define MyAppExeName "CalcTAF Web.lnk"

[Setup]
AppId={{8D5E5D5A-5E5A-4F7B-9E2C-CALCTAF2026}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}

DefaultDirName={localappdata}\CalcTAF
DefaultGroupName=CalcTAF Web
DisableProgramGroupPage=yes

OutputDir=.\instalador\saida
OutputBaseFilename=CalcTAFWeb-Setup

Compression=lzma
SolidCompression=yes

PrivilegesRequired=lowest
WizardStyle=modern

[Files]
Source: ".\instalador\app\*"; DestDir: "{app}\app"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: ".\instalador\database\*"; DestDir: "{app}\database"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: ".\instalador\runtime\*"; DestDir: "{app}\runtime"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: ".\instalador\scripts\*"; DestDir: "{app}\scripts"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\CalcTAF Web"; Filename: "{app}\scripts\iniciar-calctaf.bat"; WorkingDir: "{app}"; IconFilename: "{app}\app\frontend\dist\CalcTAFWeb.ico"
Name: "{userdesktop}\CalcTAF Web"; Filename: "{app}\scripts\iniciar-calctaf.bat"; WorkingDir: "{app}"; IconFilename: "{app}\app\frontend\dist\CalcTAFWeb.ico"

[Run]
Filename: "{app}\scripts\iniciar-calctaf.bat"; Description: "Iniciar o CalcTAF Web"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: filesandordirs; Name: "{app}"
