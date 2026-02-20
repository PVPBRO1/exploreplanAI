$base = 'http://127.0.0.1:8000'
$scrapers = Invoke-RestMethod -Uri "$base/api/scrapers"

# Check Priceline Hotels images
$priceline = $scrapers | Where-Object { $_.name -eq 'Priceline Hotels' }
if ($priceline) {
    $runs = Invoke-RestMethod -Uri "$base/api/scrapers/$($priceline.id)/runs"
    $latestRun = $runs | Select-Object -First 1
    if ($latestRun) {
        Write-Host "=== PRICELINE HOTELS ===" -ForegroundColor Cyan
        Write-Host "Latest run: $($latestRun.id) - status: $($latestRun.status)"
        $results = Invoke-RestMethod -Uri "$base/api/runs/$($latestRun.id)/results"
        foreach ($r in $results.results) {
            $name = if ($r.hotel_name) { $r.hotel_name.Substring(0, [math]::Min(40, $r.hotel_name.Length)) } else { "(no name)" }
            $url = $r.image_url
            $urlLen = if ($url) { $url.Length } else { 0 }
            Write-Host ""
            Write-Host "HOTEL: $name" -ForegroundColor Yellow
            Write-Host "IMAGE URL ($urlLen chars): $url"
        }
    } else {
        Write-Host "No runs found for Priceline Hotels" -ForegroundColor Red
    }
} else {
    Write-Host "Priceline Hotels scraper not found" -ForegroundColor Red
}

# Check Skyscanner Flights images (flights may not have images)
$flights = $scrapers | Where-Object { $_.name -eq 'Skyscanner Flights' }
if ($flights) {
    $runs = Invoke-RestMethod -Uri "$base/api/scrapers/$($flights.id)/runs"
    $latestRun = $runs | Select-Object -First 1
    if ($latestRun) {
        Write-Host ""
        Write-Host "=== SKYSCANNER FLIGHTS ===" -ForegroundColor Cyan
        Write-Host "Latest run: $($latestRun.id) - status: $($latestRun.status)"
        $results = Invoke-RestMethod -Uri "$base/api/runs/$($latestRun.id)/results"
        $count = ($results.results | Measure-Object).Count
        Write-Host "Results: $count flights"
        if ($count -gt 0) {
            $first = $results.results[0]
            Write-Host "Sample: $($first.airline) - $($first.price_per_person)"
        }
    }
}
