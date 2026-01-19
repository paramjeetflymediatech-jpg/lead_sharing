export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Column 1: Homeowners */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Homeowners</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#" className="hover:text-[#1149C7]">Create a job</a></li>
              <li><a href="#" className="hover:text-[#1149C7]">Testimonials</a></li>
              <li><a href="#" className="hover:text-[#1149C7]">How it works</a></li>
              <li><a href="#" className="hover:text-[#1149C7]">Help & FAQs</a></li>
              <li><a href="#" className="hover:text-[#1149C7]">User agreement</a></li>
            </ul>
          </div>

          {/* Column 2: Tradesperson */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Tradesperson</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="/auth/register?role=TRADESPERSON" className="hover:text-[#1149C7]">Sign up</a></li>
              <li><a href="#" className="hover:text-[#1149C7]">How it works</a></li>
              <li><a href="#" className="hover:text-[#1149C7]">Help & FAQs</a></li>
              <li><a href="#" className="hover:text-[#1149C7]">User agreement</a></li>
            </ul>
          </div>

          {/* Column 3: Leadsharing */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Leadsharing</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#" className="hover:text-[#1149C7]">About us</a></li>
              <li><a href="#" className="hover:text-[#1149C7]">Rated Group</a></li>
              <li><a href="#" className="hover:text-[#1149C7]">Careers</a></li>
              <li><a href="#" className="hover:text-[#1149C7]">Partners</a></li>
              <li><a href="#" className="hover:text-[#1149C7]">Affiliates</a></li>
              <li><a href="#" className="hover:text-[#1149C7]">Legal</a></li>
            </ul>
          </div>

          {/* Column 4: Download Apps */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Download our apps</h3>
            <div className="flex flex-col space-y-3">
              <a href="#" className="bg-black text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 w-full max-w-[200px]">
                <span className="text-xs text-left leading-tight">Available on the<br /><span className="text-sm font-bold">App Store</span></span>
              </a>
              <a href="#" className="bg-black text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 w-full max-w-[200px]">
                <span className="text-xs text-left leading-tight">Android app on<br /><span className="text-sm font-bold">Google Play</span></span>
              </a>
            </div>
            <div className="mt-8">
              <h3 className="font-bold text-gray-900 mb-4">Follow us</h3>
              <div className="flex space-x-4">
                {/* Social Icons Placeholders */}
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-xs text-gray-500">
          <p className="mb-2">Copyright © 2005 - 2026 Leadsharing Ltd. All Rights Reserved</p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:underline">Terms of Use</a>
            <span>|</span>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:underline">Cookies</a>
            <span>|</span>
            <a href="#" className="hover:underline">Sitemap</a>
            <span>|</span>
            <a href="#" className="hover:underline">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
