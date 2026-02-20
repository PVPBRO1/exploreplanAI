###############################################################################
# test-scrapers.ps1 - Full ScraperClaw pipeline test
# Tests each scraper individually via the 3-step API:
#   1. POST /api/scrapers/{id}/run  -> get run_id
#   2. GET  /api/runs/{run_id}      -> poll until success/failed
#   3. GET  /api/runs/{run_id}/results -> fetch data
#
# Usage: powershell -ExecutionPolicy Bypass -File scripts/test-scrapers.ps1
###############################################################################

$ErrorActionPreference = 'Stop'
$base = 'http://127.0.0.1:8000'

function Write-Section($text) { Write-Host "`n========================================" -ForegroundColor DarkCyan; Write-Host "  $text" -ForegroundColor Cyan; Write-Host "========================================" -ForegroundColor DarkCyan }
function Write-Ok($text) { Write-Host "  [OK] $text" -ForegroundColor Green }
function Write-Fail($text) { Write-Host "  [FAIL] $text" -ForegroundColor Red }
function Write-Info($text) { Write-Host "  $text" -ForegroundColor Gray }

# Step 0: Discover scrapers
Write-Section "Discovering scrapers"
try {
    $scrapers = Invoke-RestMethod -Uri "$base/api/scrapers" -Method GET
    Write-Ok "Found $($scrapers.Count) scrapers"
    foreach ($s in $scrapers) {
        Write-Info "$($s.name) -> $($s.id)"
    }
} catch {
    Write-Fail "Could not connect to ScraperClaw at $base. Is it running?"
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Helper: Run a scraper and return results
function Test-Scraper {
    param(
        [string]$ScraperName,
        [string]$ParamsJson,
        [int]$MaxPollSeconds = 120
    )

    $scraper = $scrapers | Where-Object { $_.name -eq $ScraperName }
    if (-not $scraper) {
        Write-Fail "Scraper '$ScraperName' not found"
        return $null
    }
    $id = $scraper.id

    Write-Section "Testing: $ScraperName"
    Write-Info "Scraper ID: $id"
    Write-Info "Params: $ParamsJson"

    # Step 1: Start run
    $startTime = Get-Date
    try {
        $runResp = Invoke-RestMethod -Uri "$base/api/scrapers/$id/run" -Method POST -Body $ParamsJson -ContentType 'application/json'
        $runId = $runResp.run_id
        Write-Ok "Run started: $runId"
    } catch {
        Write-Fail "Failed to start run: $($_.Exception.Message)"
        return $null
    }

    # Step 2: Poll
    $maxPolls = [math]::Ceiling($MaxPollSeconds / 2)
    $status = 'running'
    for ($i = 0; $i -lt $maxPolls; $i++) {
        Start-Sleep -Seconds 2
        try {
            $statusResp = Invoke-RestMethod -Uri "$base/api/runs/$runId"
            $status = $statusResp.status
            $elapsed = ((Get-Date) - $startTime).TotalSeconds
            Write-Info "Poll $i : status=$status (${elapsed}s elapsed)"
            if ($status -eq 'success' -or $status -eq 'failed') { break }
        } catch {
            Write-Info "Poll $i : request failed, retrying..."
        }
    }

    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalSeconds, 1)
    if ($status -ne 'success') {
        Write-Fail "Run did NOT succeed. Final status: $status ($elapsed s)"
        return $null
    }

    # Step 3: Fetch results
    try {
        $resultsResp = Invoke-RestMethod -Uri "$base/api/runs/$runId/results"
        $results = $resultsResp.results
        $count = ($results | Measure-Object).Count
        Write-Ok "Got $count results in $elapsed seconds"
        return $results
    } catch {
        Write-Fail "Failed to fetch results: $($_.Exception.Message)"
        return $null
    }
}

# ─── Test Airbnb ───
$airbnbParams = '{"params":{"location":"Seattle, WA","checkin":"2026-03-20","checkout":"2026-03-25","max_results":5}}'
$airbnbResults = Test-Scraper -ScraperName "Airbnb Listings" -ParamsJson $airbnbParams

if ($airbnbResults) {
    Write-Host ""
    $withImages = 0
    $withPrices = 0
    foreach ($r in $airbnbResults) {
        $title = if ($r.title) { $r.title.Substring(0, [math]::Min(50, $r.title.Length)) } else { "(no title)" }
        $img = if ($r.image_url) { "HAS IMAGE"; $withImages++ } else { "NO IMAGE" }
        $price = if ($r.price_per_night) { "`$$($r.price_per_night)/night"; $withPrices++ } else { "no price" }
        Write-Info "  $title | $price | $img"
    }
    Write-Host ""
    Write-Ok "Airbnb: $($airbnbResults.Count) results, $withImages with images, $withPrices with prices"
} else {
    Write-Fail "Airbnb: No results returned"
}

# ─── Test Priceline ───
$pricelineParams = '{"params":{"city":"Seattle, WA","checkin":"2026-03-20","checkout":"2026-03-25","rooms":1,"adults":2,"max_results":5}}'
$pricelineResults = Test-Scraper -ScraperName "Priceline Hotels" -ParamsJson $pricelineParams -MaxPollSeconds 120

if ($pricelineResults) {
    Write-Host ""
    $withImages = 0
    foreach ($r in $pricelineResults) {
        $name = if ($r.hotel_name) { $r.hotel_name.Substring(0, [math]::Min(50, $r.hotel_name.Length)) } else { "(no name)" }
        $img = if ($r.image_url) { "HAS IMAGE"; $withImages++ } else { "NO IMAGE" }
        $price = if ($r.price_per_night) { $r.price_per_night } else { "no price" }
        Write-Info "  $name | $price | $img"
    }
    Write-Host ""
    Write-Ok "Priceline: $($pricelineResults.Count) results, $withImages with images"
} else {
    Write-Fail "Priceline: No results returned (scraper may need fixing)"
}

# ─── Test Skyscanner/Google Flights ───
$flightsParams = '{"params":{"origin":"New York","destination":"Seattle","departure_date":"2026-03-20","return_date":"2026-03-25","adults":1,"max_results":5}}'
$flightResults = Test-Scraper -ScraperName "Skyscanner Flights" -ParamsJson $flightsParams -MaxPollSeconds 120

if ($flightResults) {
    Write-Host ""
    foreach ($r in $flightResults) {
        $airline = if ($r.airline) { $r.airline } else { "Unknown" }
        $price = if ($r.price_per_person) { "`$$($r.price_per_person)" } else { "no price" }
        $stops = if ($null -ne $r.stops) { "$($r.stops) stop(s)" } else { "?" }
        Write-Info "  $airline | $price | $stops"
    }
    Write-Host ""
    Write-Ok "Flights: $($flightResults.Count) results"
} else {
    Write-Fail "Flights: No results returned"
}

# ─── Summary ───
Write-Section "SUMMARY"
$airbnbOk = $null -ne $airbnbResults -and $airbnbResults.Count -gt 0
$pricelineOk = $null -ne $pricelineResults -and $pricelineResults.Count -gt 0
$flightsOk = $null -ne $flightResults -and $flightResults.Count -gt 0

if ($airbnbOk) { Write-Ok "Airbnb:    PASS ($($airbnbResults.Count) results)" } else { Write-Fail "Airbnb:    FAIL" }
if ($pricelineOk) { Write-Ok "Priceline: PASS ($($pricelineResults.Count) results)" } else { Write-Fail "Priceline: FAIL" }
if ($flightsOk) { Write-Ok "Flights:   PASS ($($flightResults.Count) results)" } else { Write-Fail "Flights:   FAIL" }

if ($airbnbOk -and $pricelineOk -and $flightsOk) {
    Write-Host "`nAll scrapers working!" -ForegroundColor Green
} elseif ($airbnbOk) {
    Write-Host "`nAirbnb working. Other scrapers may need attention." -ForegroundColor Yellow
} else {
    Write-Host "`nSome scrapers failed." -ForegroundColor Red
}
