import { useState, useEffect } from 'react';
import { Menu, X, User, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { BRAND_NAME, ASSISTANT_AVATAR } from '../lib/constants/branding';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Destinations', href: '#where-to-go' },
    { label: 'FAQ', href: '#faq' },
  ];

  const pillClass = isScrolled
    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src={ASSISTANT_AVATAR}
              alt="Vincent"
              className="h-8 w-8 rounded-full object-cover border-2 border-white/50"
            />
            <span
              className={`text-lg font-semibold transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}
            >
              {BRAND_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`font-medium text-sm transition-colors duration-300 ${
                  isScrolled ? 'text-zinc-700 hover:text-zinc-900' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${pillClass}`}>
              <Globe className="w-4 h-4 inline mr-1" />
              EN
            </button>
            <button className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${pillClass}`}>
              °C
            </button>
            <button
              onClick={() => navigate('/chat')}
              className={`p-2 rounded-full transition-all duration-300 ${pillClass}`}
            >
              <User className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/chat')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                isScrolled
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-md'
                  : 'bg-white text-zinc-900 hover:bg-white/90'
              }`}
            >
              Start chatting
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`sm:hidden p-2 transition-colors duration-300 ${
              isScrolled ? 'text-zinc-900' : 'text-white'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden py-4 border-t border-gray-200 bg-white">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block px-3 py-2.5 text-zinc-900 hover:bg-gray-50 font-medium text-sm rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-gray-200 mt-2 px-3">
                <button
                  onClick={() => { navigate('/chat'); setIsMobileMenuOpen(false); }}
                  className="block w-full text-center bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold px-5 py-2.5 rounded-full"
                >
                  Start chatting
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
