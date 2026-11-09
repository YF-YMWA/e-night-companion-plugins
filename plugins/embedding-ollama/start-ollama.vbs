Option Explicit
' Silent Ollama starter for ENbot. ASCII-only to avoid VBScript encoding issues.
Dim sh, fso, dir, exe, running
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
dir = fso.GetParentFolderName(WScript.ScriptFullName)
exe = dir & "\ollama.exe"

If Not fso.FileExists(exe) Then
  WScript.Quit 0
End If

sh.Environment("PROCESS")("OLLAMA_MODELS") = dir & "\models"
sh.Environment("PROCESS")("OLLAMA_HOST") = "127.0.0.1:11434"
sh.Environment("PROCESS")("USERPROFILE") = dir
sh.Environment("PROCESS")("HOME") = dir

On Error Resume Next
running = sh.Run("cmd /c tasklist /FI ""IMAGENAME eq ollama.exe"" | find /I ""ollama.exe"" >NUL", 0, True)
On Error GoTo 0
If running = 0 Then
  WScript.Quit 0
End If

sh.CurrentDirectory = dir
sh.Run """" & exe & """ serve", 0, False
