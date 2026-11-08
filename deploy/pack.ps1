# Đóng gói TramTrack thành tramtrack.tgz (không có .env, không có node_modules, không có tệp mã in).
# Chạy trong PowerShell:  powershell -ExecutionPolicy Bypass -File D:\tramtrack-system\deploy\pack.ps1
$root  = 'D:\tramtrack-system'
$stage = Join-Path $env:TEMP 'tt-stage'
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory $stage | Out-Null

Push-Location "$root\tramtrack-client"
npm run build
Pop-Location

robocopy "$root\tramtrack-server" "$stage\server" /E /XD node_modules /XF .env "IN-*.csv" "IN-*.html" "*.log" | Out-Null
robocopy "$root\tramtrack-client\dist" "$stage\web" /E | Out-Null
Copy-Item "$root\deploy\setup.sh" "$stage\setup.sh"

if (Test-Path "$stage\server\.env") { throw "Có .env trong gói, dừng lại." }
tar -czf "$root\tramtrack.tgz" -C $stage server web setup.sh
Get-Item "$root\tramtrack.tgz" | Select-Object Name, Length
Write-Host "Xong. Tệp: $root\tramtrack.tgz"
