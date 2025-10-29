# Simple smoke tests for Reviews-Maker server
# Usage: run this from the server directory after starting the server

param(
    [string]$base = "http://localhost:3000"
)
Write-Host "Running smoke tests against $base"

function Test-Get($path) {
    try {
        $url = "$base$path"
        Write-Host "GET $url"
        $r = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 10
        Write-Host "  OK: status returned; sample: " -NoNewline
        if ($r -is [System.Collections.IEnumerable]) { Write-Host "(array) count=$($r.Count)" } else { Write-Host "(object) keys=$($r | Get-Member -MemberType NoteProperty | Select -ExpandProperty Name -First 5 -ErrorAction SilentlyContinue)" }
        return $true
    }
    catch {
        Write-Host "  FAIL:" $_ -ForegroundColor Red
        return $false
    }
}

$allOk = $true
$allOk = (Test-Get "/api/ping") -and $allOk
$allOk = (Test-Get "/api/reviews") -and $allOk
$allOk = (Test-Get "/app.js") -and $allOk

if ($allOk) { Write-Host "Smoke tests passed" -ForegroundColor Green; exit 0 } else { Write-Host "Smoke tests failed" -ForegroundColor Red; exit 1 }
