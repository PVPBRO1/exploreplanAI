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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <OrganizeGrid />
        <GetInspired />
        <ItineraryDemo />
        <CTABanner />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
