$ErrorActionPreference = 'Stop'
$base = 'http://127.0.0.1:8000'
$scraperId = 'e84b06ac-a6d9-48e2-8cec-31823428c703'

Write-Host "=== Step 1: Start Airbnb scraper run ===" -ForegroundColor Cyan
$body = '{"params":{"location":"Seattle, WA","checkin":"2026-03-20","checkout":"2026-03-25","max_results":3}}'
$startResp = Invoke-RestMethod -Uri "$base/api/scrapers/$scraperId/run" -Method POST -Body $body -ContentType 'application/json'
$runId = $startResp.run_id
Write-Host "Run started: $runId" -ForegroundColor Green

Write-Host "`n=== Step 2: Poll for completion ===" -ForegroundColor Cyan
$maxPolls = 60
for ($i = 0; $i -lt $maxPolls; $i++) {
    Start-Sleep -Seconds 2
    $status = Invoke-RestMethod -Uri "$base/api/runs/$runId"
    Write-Host "  Poll $i : status=$($status.status)"
    if ($status.status -eq 'success' -or $status.status -eq 'failed') {
        break
    }
}

if ($status.status -ne 'success') {
    Write-Host "Run did NOT succeed. Final status: $($status.status)" -ForegroundColor Red
    Write-Host ($status | ConvertTo-Json -Depth 5)
    exit 1
}

Write-Host "`n=== Step 3: Fetch results ===" -ForegroundColor Cyan
$results = Invoke-RestMethod -Uri "$base/api/runs/$runId/results"
$count = ($results.results | Measure-Object).Count
Write-Host "Got $count results" -ForegroundColor Green

foreach ($r in $results.results) {
    $title = if ($r.title) { $r.title } else { $r.hotel_name }
    $img = if ($r.image_url) { "HAS IMAGE" } else { "NO IMAGE" }
    $price = if ($r.price_per_night) { "`$$($r.price_per_night)/night" } else { "no price" }
    Write-Host "  - $title | $price | $img"
}
