import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="text-xl font-bold text-zinc-900 tracking-tight block mb-3">
              ExplorePlan
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              AI powered travel planning. Build your perfect itinerary in minutes.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-sm font-semibold text-zinc-900 mb-4">Product</p>
            <div className="flex flex-col gap-3 text-sm">
              <Link to="/chat" className="text-gray-500 hover:text-zinc-900 transition-colors">Start chatting</Link>
              <a href="#how-it-works" className="text-gray-500 hover:text-zinc-900 transition-colors">How it works</a>
              <a href="#inspired" className="text-gray-500 hover:text-zinc-900 transition-colors">Destinations</a>
              <a href="#faq" className="text-gray-500 hover:text-zinc-900 transition-colors">FAQ</a>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <p className="text-sm font-semibold text-zinc-900 mb-4">Popular trips</p>
            <div className="flex flex-col gap-3 text-sm">
              <Link to="/chat" className="text-gray-500 hover:text-zinc-900 transition-colors">Paris, France</Link>
              <Link to="/chat" className="text-gray-500 hover:text-zinc-900 transition-colors">Tokyo, Japan</Link>
              <Link to="/chat" className="text-gray-500 hover:text-zinc-900 transition-colors">Bali, Indonesia</Link>
              <Link to="/chat" className="text-gray-500 hover:text-zinc-900 transition-colors">New York City</Link>
              <Link to="/chat" className="text-gray-500 hover:text-zinc-900 transition-colors">Rome, Italy</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="text-sm font-semibold text-zinc-900 mb-4">Company</p>
            <div className="flex flex-col gap-3 text-sm">
              <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">About</a>
              <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">Blog</a>
              <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">Contact</a>
              <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} ExplorePlan. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-gray-400 hover:text-zinc-900 transition-colors">Twitter</a>
            <a href="#" className="text-xs text-gray-400 hover:text-zinc-900 transition-colors">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
