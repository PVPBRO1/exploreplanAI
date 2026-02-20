$ErrorActionPreference = 'Stop'
$base = 'http://127.0.0.1:8000'

$scrapers = Invoke-RestMethod -Uri "$base/api/scrapers" -Method GET
$priceline = $scrapers | Where-Object { $_.name -eq 'Priceline Hotels' }
$id = $priceline.id
Write-Host "Testing Priceline Hotels (Google Hotels backend) - ID: $id" -ForegroundColor Cyan

$body = '{"params":{"city":"Seattle, WA","checkin":"2026-03-20","checkout":"2026-03-25","max_results":5}}'
$runResp = Invoke-RestMethod -Uri "$base/api/scrapers/$id/run" -Method POST -Body $body -ContentType 'application/json'
$runId = $runResp.run_id
Write-Host "Run started: $runId" -ForegroundColor Green

$maxPolls = 60
for ($i = 0; $i -lt $maxPolls; $i++) {
    Start-Sleep -Seconds 3
    $statusResp = Invoke-RestMethod -Uri "$base/api/runs/$runId"
    Write-Host "  Poll $i : status=$($statusResp.status)"
    if ($statusResp.status -eq 'success' -or $statusResp.status -eq 'failed') { break }
}

if ($statusResp.status -eq 'success') {
    $results = Invoke-RestMethod -Uri "$base/api/runs/$runId/results"
    $count = ($results.results | Measure-Object).Count
    Write-Host "`nGot $count results!" -ForegroundColor Green
    foreach ($r in $results.results) {
        $name = if ($r.hotel_name) { $r.hotel_name } else { "(unnamed)" }
        $img = if ($r.image_url) { "HAS IMAGE" } else { "NO IMAGE" }
        $price = if ($r.price_per_night) { $r.price_per_night } else { "no price" }
        Write-Host "  $name | $price | $img"
    }
} else {
    Write-Host "Run failed with status: $($statusResp.status)" -ForegroundColor Red
}
