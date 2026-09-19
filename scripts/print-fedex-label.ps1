# Auto-print FedEx label PDFs dropped into a watch folder (Windows / XI).
# Usage: powershell -ExecutionPolicy Bypass -File scripts\print-fedex-label.ps1
param(
    [string]$WatchDir = "G:\eekseye.com (Website Files)\fedex-labels"
)

if (-not (Test-Path -LiteralPath $WatchDir)) {
    New-Item -ItemType Directory -Path $WatchDir | Out-Null
}

Write-Host "Watching $WatchDir for new PDF labels. Ctrl+C to stop."
$watcher = New-Object System.IO.FileSystemWatcher $WatchDir, "*.pdf"
$watcher.IncludeSubdirectories = $false
$watcher.EnableRaisingEvents = $true

$action = {
    $path = $Event.SourceEventArgs.FullPath
    Start-Sleep -Seconds 1
    try {
        Start-Process -FilePath $path -Verb Print
        Write-Host "$(Get-Date -Format o) Printed: $path"
    } catch {
        Write-Warning "Print failed for $path : $_"
    }
}

Register-ObjectEvent $watcher Created -Action $action | Out-Null
while ($true) { Start-Sleep -Seconds 5 }
