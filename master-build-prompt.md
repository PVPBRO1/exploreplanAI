# Master Build Prompt: AI-Automated Vacation Planning Platform

---

## Context & Market Intelligence

You are building an AI-automated vacation planning e-commerce platform entering a **$1.74B market** (projected $9.13B by 2033, 18.9% CAGR). The broader online travel market exceeds $650B. Your strategic position exploits four validated market gaps:

1. **The $50–$150 "Just the Itinerary" Gap** — KimKim sells full trips at $1,000+, Fora operates on commissions, ViaHero charges $210–$280/week with multi-day human wait times, and Fiverr delivers inconsistent quality at $10–$40. No one owns the high-quality, beautifully presented, instantly delivered standalone itinerary at $50–$150.

2. **The Speed Gap** — Competitors deliver in 1–5 days. You deliver in 30–90 minutes. Last-minute travelers and impatient planners are structurally unserved.

3. **The Consistency Gap** — Human planners and Fiverr freelancers have variable quality. AI delivers identical quality standards on every order, enabling confident brand promises.

4. **The Scale Gap** — No competitor can profitably serve 10,000+ customers/month with custom itineraries. Your AI model can, with infrastructure costs under $5,000/month.

---

## Competitive Decisions Already Made

Based on analysis of 6 direct competitors (ViaHero, Journy, Utrip, KimKim, Fora Travel, Fiverr planners), the following strategic decisions are locked:

- **Direct-to-consumer e-commerce model** (not B2B licensing — Utrip proved that fails)
- **Near-zero marginal cost per itinerary** (not human-dependent — Journy proved that fails during demand shocks)
- **Tiered pricing**: 3-Day ($39–$59), 7-Day ($79–$129), 14-Day ($149–$249), Local Secrets Add-on ($29–$49), Revision Pass ($19–$29)
- **AI generation cost per itinerary**: $0.05–$0.50 (99.6%+ gross margin)
- **Realistic net margins**: 52.7% at launch (50 orders/mo) scaling to 88.1% at maturity (500 orders/mo)
- **Revenue diversification**: Core itinerary sales + affiliate commissions (Booking.com, Viator) + subscription model ($9.99/mo Travel Club) + premium human review add-on ($29–$49) + future white-label API licensing
- **Tech stack direction**: Next.js + Stripe + Vercel + PostgreSQL (Supabase) + OpenAI GPT-4.1 primary / Claude fallback + Google Places API enrichment + React-PDF generation + SendGrid delivery
- **Launch destinations**: Paris, Tokyo, Rome, Bali, New York City
- **Purchase flow**: 4 steps, under 3 minutes — (1) Select destination, (2) Choose dates & preferences, (3) Pay, (4) Receive itinerary

---

## Five UX Principles (Non-Negotiable)

Derived from competitor successes and failures:

**1. Speed-to-Value under 90 seconds** — Show a preview or sample output before purchase. Deliver final product within 30–90 minutes of payment. Include a "preparing your itinerary" status page with countdown.

**2. Customization must feel personal, not algorithmic** — Every itinerary includes 3–5 "insider" recommendations per day (hidden gems, local favorites, time-specific tips like "Arrive at the Trevi Fountain before 7 AM to avoid crowds").

**3. Visual presentation justifies the price** — Clean typography, embedded maps, venue photos, branded templates. The difference between a $25 Google Doc and a $129 product IS the presentation.

**4. Frictionless purchase flow** — No account creation required to buy. Single-page preference form. Stripe Checkout. Instant confirmation.

**5. Post-purchase engagement drives referrals** — Automated touchpoints: "3 days before your trip" weather/packing email, "during your trip" check-in, "post-trip" review request + referral incentive (15% discount code).

---

## AI Quality Bars (Minimum Standards)

- **Venue Accuracy**: Every venue must currently exist, be open during suggested times, and match the budget tier. Validate via Google Places API.
- **Logistics Realism**: Transit times between consecutive venues must be physically possible. No impossible scheduling.
- **Seasonal Awareness**: Account for weather, seasonal closures, holidays, and local events.
- **Depth Over Breadth**: 3–5 primary activities per day with enough detail to follow without additional research.
- **Cultural Sensitivity**: Dress codes, tipping customs, local etiquette, and safety considerations included.

---

## UI Plan: Feature Breakdown (A, B, C)

The UI follows a **SaaS site aesthetic** — clean, modern, welcoming, high-quality, highly informative, trustworthy, and compelling. Think: the polish of Stripe's marketing site meets the warmth of Airbnb's discovery experience. Muted yet vibrant color palette (soft navy, warm whites, accent coral or teal). Generous whitespace. Premium typography. Subtle micro-animations. Trust signals everywhere.

---

## FEATURE A — The Storefront & Discovery Experience

**Purpose**: Convert visitors into buyers. This is the first impression — it must communicate trust, quality, and speed instantly.

### Pages & Components

**Hero Landing Page**
- Full-width destination imagery with a clear value prop headline ("Your Dream Vacation, Planned by AI in Under 60 Minutes")
- Animated badge showing "4,200+ itineraries delivered" (social proof counter)
- Primary CTA: "Plan My Trip" button
- Secondary CTA: "See a Free Sample"

**Destination Catalog Page**
- Searchable grid of destination cards with hero images, starting prices, and traveler ratings
- "Popular Destinations" carousel and "Trending Now" section
- Filter by region, trip length, and travel style
- Each card shows price, delivery time ("Ready in ~45 min"), and star rating

**Single Destination Product Page**
- Large hero imagery of the destination
- Pricing tiers clearly displayed (3-day / 7-day / 14-day)
- "What's Included" checklist (day-by-day plan, restaurant picks, pro tips, interactive map, PDF download, 1 free revision)
- Free Day 1 sample preview (expandable accordion or modal)
- Customer reviews with uploaded traveler photos
- FAQ accordion
- Trust badges (Stripe secure payment, satisfaction guarantee, "4.8/5 average rating")

**Preference Intake Form (Single Page)**
- Clean, card-based form with:
  - Date picker (or "flexible dates" toggle)
  - Travel party selector (visual icons: solo / couple / family / group)
  - Interest toggle chips (food, history, nature, adventure, nightlife, shopping, art, relaxation)
  - Pace slider (relaxed → moderate → packed)
  - Budget tier selector (budget / mid-range / luxury)
  - Dietary & accessibility dropdowns
  - Special requests text area
- Real-time price display updating as selections change
- Progress indicator showing "Step 2 of 4"

**Stripe Checkout Integration**
- Seamless embedded checkout (not redirect)
- Order summary sidebar
- Launch discount badge if applicable
- Instant order confirmation page with: order number, estimated delivery time countdown, "What happens next" explainer, email confirmation sent notification

**"Preparing Your Itinerary" Status Page**
- Animated progress indicator (e.g., a plane flying across a route map)
- Status updates: "Researching local gems..." → "Building your day-by-day plan..." → "Adding maps & pro tips..." → "Almost ready!"
- Email notification on completion
- This page converts wait time into anticipation and perceived value

### Design Direction
Clean white/light background. Navy or deep teal primary color. Coral or warm gold accent for CTAs. High-res destination photography throughout. Card-based layouts with subtle shadows. Sans-serif typography (Inter, DM Sans, or similar). Trust and credibility woven into every section — ratings, review counts, "as featured in" logos, security badges.

---

## FEATURE B — The Customer Dashboard & Itinerary Viewer

**Purpose**: Deliver the product beautifully, encourage engagement, enable revisions, and drive upsells/referrals.

### Pages & Components

**Dashboard Home**
- "My Trips" grid showing all purchased itineraries with destination thumbnails, trip dates, and status badges (Upcoming / In Progress / Completed)
- Trip countdown timer for the nearest upcoming trip
- Quick links: "Download PDF", "Share with Companion", "Request Revision"
- Upsell card: "Add Local Secrets for [Destination]" or "Extend your trip to 10 days"

**Interactive Itinerary Viewer (Core Deliverable)**
- Day-by-day tabbed or timeline view
- Each day card expands into morning / afternoon / evening blocks
- Each activity block includes:
  - Venue name + photo
  - Address with map pin link
  - Hours of operation and average cost
  - "Why we recommend this" blurb (the local expert touch)
  - Walking/transit directions to next venue with estimated time
  - "Pro Tip" callout box with insider knowledge
- Embedded interactive map (Mapbox or Google Maps) with color-coded pins for each day
- "Book This" affiliate buttons for hotels (Booking.com) and tours (Viator/GetYourGuide) — styled as helpful, not pushy
- Restaurant recommendations tagged by cuisine type and budget tier
- Downloadable PDF button (beautifully branded, print-ready)

**Revision Interface**
- Simple form: select a day, select an activity to swap, describe what you want instead (or choose from AI suggestions)
- 1 free revision included; additional revisions prompt upgrade to Revision Pass ($19–$29)
- Revision delivered within 15–30 minutes

**Share & Collaborate**
- Generate a shareable link for travel companions (view-only, no login required)
- Companion view shows the full itinerary in a clean read-only format
- (Phase 3: Group voting on activities for consensus itineraries)

**Post-Trip Flow**
- After trip end date passes, prompt for review + photo upload
- Display incentive: "Leave a review and get 15% off your next itinerary"
- Referral code generator with tracking

### Design Direction
Dashboard uses a slightly warmer palette — soft cream or warm gray backgrounds with the same navy/teal accents. Card-based layout with generous padding. The itinerary viewer should feel like reading a premium travel magazine — beautiful typography, venue photography, clean information hierarchy. Map is a prominent, always-visible element. Mobile-responsive and optimized for on-the-go use during the actual trip.

---

## FEATURE C — The Operational Backend, AI Pipeline & Growth Engine

**Purpose**: Power the entire business with near-zero human intervention. Monitor quality, optimize performance, and scale.

### Components

**Admin Dashboard**
- Real-time order feed with status indicators (Queued → Generating → Quality Check → Delivered → Viewed)
- Revenue metrics: daily/weekly/monthly revenue, average order value, orders by destination
- Quality metrics: average rating, revision request rate, refund rate
- AI performance: average generation time, API cost per itinerary, quality check pass/fail rate
- Customer support queue (flagged items requiring human intervention)

**AI Generation Pipeline (Backend)**
- Order webhook receiver (Stripe) → job queue (BullMQ) → prompt assembly (destination knowledge base + user preferences + style template) → LLM Generation Pass 1 (raw itinerary via GPT-4.1) → Enrichment Layer (Google Places API validation — hours, ratings, coordinates, photos) → LLM Generation Pass 2 (quality polish, gap filling, tone check) → Automated Quality Gate (all days covered? no duplicate venues? transit times realistic? venues verified open?) → Template rendering (React-PDF for PDF, Next.js for web view) → Delivery (SendGrid email + dashboard unlock)
- Fail states route to human review queue
- A/B testing framework for prompt variations

**Destination Knowledge Base Manager**
- Interface to add/edit destination data packages
- Each package includes: curated venue database, neighborhood guides, seasonal notes, cultural tips, transportation info
- Automated monthly data refresh flag per destination
- Quality score per destination (based on data richness and customer ratings)

**Marketing Automation Layer**
- Email sequences (ConvertKit/Mailchimp integration): order confirmation → delivery → "3 days before trip" weather + packing tips → "during trip" check-in → post-trip review request → referral follow-up
- Social media content calendar integration (Buffer/Later)
- Blog CMS for SEO destination guides (each guide includes free Day 1 sample + CTA)
- Affiliate link tracking dashboard (Booking.com, Viator commissions)

**Financial Operations**
- Stripe dashboard integration for payments, refunds, tax calculation
- Automated bookkeeping sync (QuickBooks)
- Monthly P&L auto-generation
- Affiliate commission tracking and reconciliation

### Design Direction
The admin side is utilitarian but polished — think Linear or Vercel's dashboard aesthetic. Dark mode option. Data-dense but well-organized with clear information hierarchy. Charts and metrics use the brand color palette. Alert system for quality issues or order failures. Mobile-friendly for on-the-go monitoring.

---

## Summary Decision Matrix

| Decision Area | Choice | Rationale |
|---|---|---|
| Business Model | D2C e-commerce, per-itinerary pricing | Utrip's B2B failed; Journy's human model collapsed |
| Price Position | $39–$249 range (mid-tier sweet spot) | Undercuts ViaHero ($210+), outclasses Fiverr ($10–$40) |
| Core Differentiator | Speed (30–90 min) + Consistency + Presentation | No competitor delivers custom quality this fast |
| UI Aesthetic | SaaS-grade polish, travel warmth | Trust + aspiration = conversion |
| Tech Stack | Next.js + Stripe + Supabase + GPT-4.1 + Vercel | Maximum automation, minimum ops overhead |
| Launch Strategy | 5 destinations, social-first marketing, $0 CAC channels | Validate before scaling spend |
| Feature Priority | A (Storefront) → B (Dashboard) → C (Backend/Scale) | Revenue-generating surfaces first |

---

*Compiled from competitive research analysis — February 2026. This prompt is the single source of truth for all downstream design, development, and planning work.*
