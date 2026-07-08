Write-Host "🚀 Starting Asset Tracker Port Forwarding..." -ForegroundColor Cyan

$frontend = Start-Process kubectl -ArgumentList "port-forward svc/frontend 30080:80" -WindowStyle Hidden -PassThru
$backend = Start-Process kubectl -ArgumentList "port-forward svc/backend 8000:8000" -WindowStyle Hidden -PassThru

Write-Host "✅ Frontend available at: http://localhost:30080" -ForegroundColor Green
Write-Host "✅ Backend API available at: http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Port forwarding is running in the background." -ForegroundColor Yellow
Write-Host "Press any key to stop them and close the connections..." -ForegroundColor Yellow

$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

Write-Host ""
Write-Host "🛑 Stopping port-forwards..." -ForegroundColor Cyan
if ($frontend) { Stop-Process -InputObject $frontend -Force -ErrorAction SilentlyContinue }
if ($backend) { Stop-Process -InputObject $backend -Force -ErrorAction SilentlyContinue }
Write-Host "Done! Have a great day." -ForegroundColor Green
