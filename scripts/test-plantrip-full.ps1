$base = 'http://localhost:8888'

$body = @{
    messages = @(
        @{ role = 'user'; content = "I'd like to plan a trip to Seattle" }
        @{ role = 'assistant'; content = '{"type":"intake","assistantMessage":"Seattle! Pike Place Market, the Space Needle, and enough coffee to fuel a small nation. Who is coming along, and when are you thinking of heading out?","nextQuestion":{"key":"travelersCount","prompt":"Who is coming?","options":["Solo","Couple","Family (3-4)","Group (5+)"]},"tripState":{"destination":"Seattle, WA","dates":null,"tripLengthDays":null,"budgetRange":null,"budgetAmount":null,"pace":null,"travelersCount":null,"interests":[],"accommodationPreference":null,"departureCity":null,"constraints":[],"startIso":null,"endIso":null},"itinerary":null}' }
        @{ role = 'user'; content = 'Solo trip, 5 days, $2000 budget, relaxed, flying from New York' }
        @{ role = 'assistant'; content = "{`"type`":`"confirmation`",`"assistantMessage`":`"Here''s what we''re looking at:\n**Route:** New York -> Seattle, WA -> New York\n**When:** 5 days starting March 15\n**Who:** Just you\n**Budget:** ~`$2,000 total\n**Vibe:** Relaxed pace\n\nDoes this sound like a solid plan? If so, I''ll get to work on the full itinerary!`",`"nextQuestion`":{`"key`":`"confirmation`",`"prompt`":`"Does this look right?`",`"options`":[`"Looks good!`",`"Change something`"]},`"tripState`":{`"destination`":`"Seattle, WA`",`"dates`":null,`"tripLengthDays`":5,`"budgetRange`":null,`"budgetAmount`":2000,`"pace`":`"relaxed`",`"travelersCount`":1,`"interests`":[],`"accommodationPreference`":null,`"departureCity`":`"New York`",`"constraints`":[],`"startIso`":`"2026-03-15`",`"endIso`":`"2026-03-20`"},`"itinerary`":null}" }
        @{ role = 'user'; content = 'Looks good!' }
    )
    tripState = @{
        destination = 'Seattle, WA'
        dates = $null
        tripLengthDays = 5
        budgetRange = $null
        budgetAmount = 2000
        pace = 'relaxed'
        travelersCount = 1
        interests = @()
        accommodationPreference = $null
        departureCity = 'New York'
        constraints = @()
        startIso = '2026-03-15'
        endIso = '2026-03-20'
    }
    language = 'en'
} | ConvertTo-Json -Depth 4

Write-Host "Testing planTrip - ITINERARY PHASE (with scraper)" -ForegroundColor Cyan
Write-Host "Trip: Seattle, 5 days, solo, relaxed, from NYC" -ForegroundColor Yellow
Write-Host "User confirmed: 'Looks good!'" -ForegroundColor Yellow
Write-Host ""

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

try {
    $response = Invoke-RestMethod -Uri "$base/.netlify/functions/planTrip" -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 300
    $stopwatch.Stop()

    Write-Host "SUCCESS in $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Green
    Write-Host "Type: $($response.type)" -ForegroundColor Yellow

    $msgPreview = $response.assistantMessage
    if ($msgPreview.Length -gt 300) { $msgPreview = $msgPreview.Substring(0, 300) + '...' }
    Write-Host "Message: $msgPreview" -ForegroundColor White

    if ($response.itinerary) {
        $dayCount = ($response.itinerary.days | Measure-Object).Count
        Write-Host ""
        Write-Host "ITINERARY GENERATED: $dayCount days" -ForegroundColor Green
        Write-Host "Title: $($response.itinerary.tripTitle)" -ForegroundColor Green
        foreach ($day in $response.itinerary.days) {
            $actCount = ($day.activities | Measure-Object).Count
            Write-Host "  Day $($day.day): $($day.title) ($actCount activities)" -ForegroundColor White
        }
    } else {
        Write-Host "NO ITINERARY" -ForegroundColor Red
    }

    if ($response.searchResults) {
        $stayCount = ($response.searchResults.stays | Measure-Object).Count
        $flightCount = ($response.searchResults.flights | Measure-Object).Count
        Write-Host ""
        Write-Host "SEARCH RESULTS: $stayCount stays, $flightCount flights" -ForegroundColor Green
        foreach ($s in $response.searchResults.stays) {
            $name = if ($s.title) { $s.title } elseif ($s.hotel_name) { $s.hotel_name } else { 'Unnamed' }
            $img = if ($s.image_url) { 'YES' } else { 'NO' }
            Write-Host "  Stay: $($name.Substring(0, [math]::Min(40, $name.Length))) | img=$img" -ForegroundColor White
        }
        foreach ($f in $response.searchResults.flights) {
            Write-Host "  Flight: $($f.airline) $($f.departure_time) `$$($f.price_per_person)" -ForegroundColor White
        }
    } else {
        Write-Host "NO SEARCH RESULTS" -ForegroundColor Yellow
    }

    if ($response.verification) {
        Write-Host ""
        Write-Host "VERIFICATION: status=$($response.verification.status)" -ForegroundColor Cyan
        Write-Host "  Attempted: $($response.verification.providersAttempted -join ', ')" -ForegroundColor Cyan
        Write-Host "  Succeeded: $($response.verification.providersSucceeded -join ', ')" -ForegroundColor Cyan
        if ($response.verification.providerErrors) {
            $response.verification.providerErrors | Format-List
        }
    }
} catch {
    $stopwatch.Stop()
    Write-Host "FAILED in $($stopwatch.ElapsedMilliseconds)ms" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
}
