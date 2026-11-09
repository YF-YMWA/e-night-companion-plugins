# Ollama + bge-m3 一键准备脚本（从插件市场安装 embedding-ollama 后使用）
#
# 用法：
#   powershell -ExecutionPolicy Bypass -File setup-ollama.ps1
#   powershell -ExecutionPolicy Bypass -File setup-ollama.ps1 -AutoStart
#   powershell -ExecutionPolicy Bypass -File setup-ollama.ps1 -InstallDir "D:\ENbot\Ollama"
#
# 只下载运行时和模型，不把 2GB 文件放进插件包。
# 默认安装到：%LOCALAPPDATA%\ENbot\Ollama

param(
  [string]$InstallDir = "$env:LOCALAPPDATA\ENbot\Ollama",
  [switch]$AutoStart,
  [switch]$SkipDownload
)

$ErrorActionPreference = 'Stop'
$dir = $InstallDir
New-Item -ItemType Directory -Force -Path $dir, (Join-Path $dir 'models'), (Join-Path $dir 'models-source') | Out-Null
Set-Location $dir

$env:OLLAMA_MODELS = Join-Path $dir 'models'
$env:OLLAMA_HOST = '127.0.0.1:11434'
$env:USERPROFILE = $dir
$env:HOME = $dir

function Download($url, $dest) {
  Write-Host "下载 $url"
  Start-BitsTransfer -Source $url -Destination $dest
}

$ollama = Join-Path $dir 'ollama.exe'
if (-not (Test-Path $ollama) -and -not $SkipDownload) {
  $zip = Join-Path $dir 'ollama-windows-amd64.zip'
  Download 'https://github.com/ollama/ollama/releases/download/v0.40.15/ollama-windows-amd64.zip' $zip
  Write-Host '解压 Ollama…'
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  [IO.Compression.ZipFile]::ExtractToDirectory($zip, $dir, $true)
  Remove-Item $zip -Force
}
if (-not (Test-Path $ollama)) { throw "找不到 ollama.exe：$ollama" }

$gguf = Join-Path $dir 'models-source\bge-m3-Q8_0.gguf'
if (-not (Test-Path $gguf) -and -not $SkipDownload) {
  try {
    Download 'https://www.modelscope.cn/models/gpustack/bge-m3-GGUF/resolve/master/bge-m3-Q8_0.gguf' $gguf
  } catch {
    Write-Host 'ModelScope 失败，换 HF 镜像…'
    Download 'https://hf-mirror.com/gpustack/bge-m3-GGUF/resolve/main/bge-m3-Q8_0.gguf' $gguf
  }
}

$mf = Join-Path $dir 'Modelfile.bge-m3'
Set-Content -Path $mf -Value 'FROM ./models-source/bge-m3-Q8_0.gguf' -Encoding UTF8
& $ollama create bge-m3 -f $mf
if ($LASTEXITCODE -ne 0) { throw 'ollama create bge-m3 失败' }

$bat = Join-Path $dir 'start-ollama.bat'
@"
@echo off
cd /d "%~dp0"
set OLLAMA_MODELS=%~dp0models
set OLLAMA_HOST=127.0.0.1:11434
set USERPROFILE=%~dp0
set HOME=%~dp0
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I "ollama.exe" >NUL
if not errorlevel 1 exit /b 0
start "" /min "%~dp0ollama.exe" serve
"@ | Set-Content -Path $bat -Encoding ASCII

$vbs = Join-Path $dir 'start-ollama.vbs'
Copy-Item (Join-Path $PSScriptRoot 'start-ollama.vbs') $vbs -Force
Start-Process -FilePath (Join-Path $env:SystemRoot 'System32\wscript.exe') -ArgumentList ('//B "' + $vbs + '"') -WorkingDirectory $dir -WindowStyle Hidden
Start-Sleep -Seconds 3
try {
  $r = Invoke-RestMethod -Method Post -Uri 'http://127.0.0.1:11434/api/embed' `
    -ContentType 'application/json' `
    -Body '{"model":"bge-m3","input":["测试"]}' -TimeoutSec 120
  Write-Host "OK：bge-m3 返回 $($r.embeddings[0].Count) 维向量"
} catch {
  Write-Host "警告：11434 暂不可用：$($_.Exception.Message)"
}

if ($AutoStart) {
  $startup = [Environment]::GetFolderPath('Startup')
  $lnk = Join-Path $startup 'ENbot Ollama.lnk'
  $ws = New-Object -ComObject WScript.Shell
  $sc = $ws.CreateShortcut($lnk)
  $sc.TargetPath = Join-Path $env:SystemRoot 'System32\wscript.exe'
  $sc.Arguments = '//B "' + (Join-Path $dir 'start-ollama.vbs') + '"'
  $sc.WorkingDirectory = $dir
  $sc.WindowStyle = 7
  $sc.Save()
  Write-Host "已加入开机启动：$lnk"
}

Write-Host "完成：$dir"
Write-Host '回到 ENbot，确认 memory.embedding.enabled=true，重启服务。'
