$base = 'http://127.0.0.1:8000'
$scrapers = Invoke-RestMethod -Uri "$base/api/scrapers"
$airbnb = $scrapers | Where-Object { $_.name -eq 'Airbnb Listings' }
$runs = Invoke-RestMethod -Uri "$base/api/scrapers/$($airbnb.id)/runs"
$latestRun = $runs | Select-Object -First 1
Write-Host "Latest run: $($latestRun.id) - status: $($latestRun.status)" -ForegroundColor Cyan
$results = Invoke-RestMethod -Uri "$base/api/runs/$($latestRun.id)/results"

foreach ($r in $results.results) {
    $title = if ($r.title) { $r.title.Substring(0, [math]::Min(40, $r.title.Length)) } else { "(no title)" }
    $url = $r.image_url
    $urlLen = if ($url) { $url.Length } else { 0 }
    Write-Host ""
    Write-Host "TITLE: $title" -ForegroundColor Yellow
    Write-Host "IMAGE URL ($urlLen chars): $url"
    if ($url -and $url.Length -gt 10) {
        Write-Host "  Ends with: ...$($url.Substring([math]::Max(0, $url.Length - 30)))"
    }
}
