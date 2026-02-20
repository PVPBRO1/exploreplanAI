$base = 'http://127.0.0.1:8000'

# Get Airbnb scraper ID
$scrapers = Invoke-RestMethod -Uri "$base/api/scrapers"
$airbnb = $scrapers | Where-Object { $_.name -eq 'Airbnb Listings' }
Write-Host "Airbnb scraper ID: $($airbnb.id)" -ForegroundColor Cyan

# Start a fresh run
$body = @{
    params = @{
        location = "Seattle, WA"
        checkin = "2026-03-15"
        checkout = "2026-03-20"
        max_results = 5
    }
} | ConvertTo-Json -Depth 3

Write-Host "Starting Airbnb scraper..." -ForegroundColor Yellow
$run = Invoke-RestMethod -Uri "$base/api/scrapers/$($airbnb.id)/run" -Method POST -Body $body -ContentType 'application/json'
$runId = $run.run_id
Write-Host "Run ID: $runId"

# Poll until complete
$maxWait = 120
$elapsed = 0
while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds 5
    $elapsed += 5
    $status = Invoke-RestMethod -Uri "$base/api/runs/$runId"
    Write-Host "  [$elapsed s] Status: $($status.status)"
    if ($status.status -eq 'success' -or $status.status -eq 'failed') { break }
}

if ($status.status -ne 'success') {
    Write-Host "Run failed or timed out!" -ForegroundColor Red
    exit 1
}

# Get results
$results = Invoke-RestMethod -Uri "$base/api/runs/$runId/results"
$count = ($results.results | Measure-Object).Count
Write-Host ""
Write-Host "=== $count RESULTS ===" -ForegroundColor Green

$badImages = 0
$goodImages = 0
$noImages = 0

foreach ($r in $results.results) {
    $title = if ($r.title) { $r.title.Substring(0, [math]::Min(50, $r.title.Length)) } else { "(no title)" }
    $url = $r.image_url
    $urlLen = if ($url) { $url.Length } else { 0 }
    
    Write-Host ""
    Write-Host "TITLE: $title" -ForegroundColor Yellow
    Write-Host "PRICE: `$$($r.price_per_night)/night"
    Write-Host "IMAGE URL ($urlLen chars): $url"
    
    if (-not $url -or $urlLen -lt 10) {
        Write-Host "  STATUS: NO IMAGE" -ForegroundColor Red
        $noImages++
    } elseif ($url -match 'platform-assets|dls-icons') {
        Write-Host "  STATUS: BADGE/ICON (not a listing photo!)" -ForegroundColor Red
        $badImages++
    } elseif ($url -match 'muscache\.com.*\.(jpeg|jpg|png|webp)') {
        Write-Host "  STATUS: VALID LISTING PHOTO" -ForegroundColor Green
        $goodImages++
    } elseif ($url -match 'muscache\.com') {
        Write-Host "  STATUS: MUSCACHE URL (check manually)" -ForegroundColor Yellow
        $goodImages++
    } else {
        Write-Host "  STATUS: UNKNOWN SOURCE" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host "Good images: $goodImages / $count"
Write-Host "Badge/icons: $badImages"
Write-Host "No images:   $noImages"

if ($badImages -gt 0 -or $noImages -gt ($count / 2)) {
    Write-Host "FAIL: Image quality issues detected" -ForegroundColor Red
} else {
    Write-Host "PASS: Images look good" -ForegroundColor Green
}
