import { Navbar } from './sections/Navbar';
import { Hero } from './sections/Hero';
import { Features } from './sections/Features';
import { ItineraryDemo } from './sections/ItineraryDemo';
import { CTABanner } from './sections/CTABanner';
import { FAQ } from './sections/FAQ';
import { Footer } from './sections/Footer';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ItineraryDemo />
        <CTABanner />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;
