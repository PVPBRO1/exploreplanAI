import { Navbar } from '../sections/Navbar';
import { Hero } from '../sections/Hero';
import { Stats } from '../sections/Stats';
import { InlineDemo } from '../sections/InlineDemo';
import { WhereToGo } from '../sections/WhereToGo';
import { AllInOne } from '../sections/AllInOne';
import { HowItWorks } from '../sections/HowItWorks';
import { Features } from '../sections/Features';
import { Testimonials } from '../sections/Testimonials';
import { FAQ } from '../sections/FAQ';
import { CTABanner } from '../sections/CTABanner';
import { Footer } from '../sections/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <InlineDemo />
        <WhereToGo />
        <AllInOne />
        <HowItWorks />
        <Features />
        <Testimonials />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
