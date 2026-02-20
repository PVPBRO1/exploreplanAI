$base = 'http://localhost:8888'

$body = @{
    messages = @(
        @{ role = 'user'; content = 'I want to go to Seattle' }
        @{ role = 'assistant'; content = '{"type":"intake","assistantMessage":"Seattle it is!","nextQuestion":{"key":"travelersCount","prompt":"Who is coming?","options":["Solo","Couple","Group"]},"tripState":{"destination":"Seattle, WA","dates":null,"tripLengthDays":null,"budgetRange":null,"budgetAmount":null,"pace":null,"travelersCount":null,"interests":[],"accommodationPreference":null,"departureCity":null,"constraints":[],"startIso":null,"endIso":null},"itinerary":null}' }
        @{ role = 'user'; content = 'Solo, 5 days, $2000 budget, relaxed pace, flying from New York, Looks good!' }
    )
    tripState = @{
        destination = 'Seattle, WA'
        dates = $null
        tripLengthDays = 5
        budgetRange = $null
        budgetAmount = 2000
        pace = 'relaxed'
        travelersCount = 1
        interests = @('adventure')
        accommodationPreference = $null
        departureCity = 'New York'
        constraints = @()
        startIso = '2026-03-15'
        endIso = '2026-03-20'
    }
    language = 'en'
} | ConvertTo-Json -Depth 4

Write-Host "Testing planTrip function..." -ForegroundColor Cyan
Write-Host "Trip: Seattle, 5 days, solo, relaxed, from NYC" -ForegroundColor Yellow
Write-Host ""

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

try {
    $response = Invoke-RestMethod -Uri "$base/.netlify/functions/planTrip" -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 300
    $stopwatch.Stop()

    Write-Host "SUCCESS in $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Green
    Write-Host "Type: $($response.type)" -ForegroundColor Yellow
    Write-Host "Message: $($response.assistantMessage.Substring(0, [math]::Min(200, $response.assistantMessage.Length)))..." -ForegroundColor White

    if ($response.itinerary) {
        $dayCount = ($response.itinerary.days | Measure-Object).Count
        Write-Host "Itinerary: $dayCount days" -ForegroundColor Green
        Write-Host "Title: $($response.itinerary.tripTitle)" -ForegroundColor Green
    }

    if ($response.searchResults) {
        $stayCount = ($response.searchResults.stays | Measure-Object).Count
        $flightCount = ($response.searchResults.flights | Measure-Object).Count
        Write-Host "SearchResults: $stayCount stays, $flightCount flights" -ForegroundColor Green
    } else {
        Write-Host "SearchResults: NONE" -ForegroundColor Yellow
    }

    if ($response.verification) {
        Write-Host "Verification: status=$($response.verification.status)" -ForegroundColor Cyan
        Write-Host "  Attempted: $($response.verification.providersAttempted -join ', ')" -ForegroundColor Cyan
        Write-Host "  Succeeded: $($response.verification.providersSucceeded -join ', ')" -ForegroundColor Cyan
    }
} catch {
    $stopwatch.Stop()
    Write-Host "FAILED in $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}
