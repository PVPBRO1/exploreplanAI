import { useState } from 'react';
import { Navbar } from '../sections/Navbar';
import { Hero } from '../sections/Hero';
import { HowItWorks } from '../sections/HowItWorks';
import { Features } from '../sections/Features';
import { OrganizeGrid } from '../sections/OrganizeGrid';
import { GetInspired } from '../sections/GetInspired';
import { ItineraryDemo } from '../sections/ItineraryDemo';
import { CTABanner } from '../sections/CTABanner';
import { FAQ } from '../sections/FAQ';
import { Footer } from '../sections/Footer';
import { WalkthroughModal } from '../sections/WalkthroughModal';

export default function HomePage() {
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero onSeeHowItWorks={() => setShowWalkthrough(true)} />
        <HowItWorks />
        <Features />
        <OrganizeGrid />
        <GetInspired />
        <ItineraryDemo />
        <CTABanner />
        <FAQ />
      </main>
      <Footer />
      <WalkthroughModal
        isOpen={showWalkthrough}
        onClose={() => setShowWalkthrough(false)}
      />
    </div>
  );
}
