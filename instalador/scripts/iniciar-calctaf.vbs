Set shell = CreateObject("WScript.Shell")
bat = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & "\iniciar-calctaf.bat"
shell.Run """" & bat & """", 0, False
