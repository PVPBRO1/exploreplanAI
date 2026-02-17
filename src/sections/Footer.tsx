export function Footer() {
  return (
    <>
      <hr className="border-gray-200 w-full" />
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col sm:flex-row gap-8">
        <div className="flex-[40%]">
          <a href="#" className="text-xl font-semibold text-zinc-900 tracking-tight">
            ExplorePlan
          </a>
        </div>

        <div className="flex-[60%] flex flex-col sm:flex-row gap-8">
          <div className="flex-[50%] text-sm flex flex-col gap-3">
            <span className="font-semibold text-zinc-900 mb-1">Get started</span>
            <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">
              Planning a trip to Paris
            </a>
            <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">
              Planning a trip to Japan
            </a>
            <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">
              Planning a trip to Bali
            </a>
            <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">
              Planning a trip to New York
            </a>
          </div>

          <div className="flex-[50%] text-sm flex flex-col gap-3">
            <span className="font-semibold text-zinc-900 mb-1">Resources</span>
            <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">
              Contact
            </a>
            <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">
              Blog
            </a>
            <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">
              Twitter
            </a>
            <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-zinc-900 transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>

      <div className="text-center pb-8">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} ExplorePlan.
        </p>
      </div>
    </>
  );
}
