import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { SOCIAL_LINKS } from "@/constants/locations";
console.log(SOCIAL_LINKS)
export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {/* Logo */}
        <div className="mb-8 flex justify-start sm:justify-start">
          <img
            src="/allcarepros-logo.png"
            alt="All Care Pros"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-start sm:text-left">
          {/* Homeowners */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Homeowners</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a href="/create-job" className="hover:text-[#1149C7]">
                  Create a job
                </a>
              </li>
              <li>
                <a href="/testimonials" className="hover:text-[#1149C7]">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="hover:text-[#1149C7]">
                  How it works
                </a>
              </li>
              <li>
                <a href="/help" className="hover:text-[#1149C7]">
                  Help & FAQs
                </a>
              </li>
              <li>
                <a href="/user-agreement" className="hover:text-[#1149C7]">
                  User agreement
                </a>
              </li>
            </ul>
          </div>

          {/* Tradesperson */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Tradesperson</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a
                  href="/auth/register?role=TRADESPERSON"
                  className="hover:text-[#1149C7]"
                >
                  Sign up
                </a>
              </li>
              <li>
                <a href="/how-it-works" className="hover:text-[#1149C7]">
                  How it works
                </a>
              </li>
              <li>
                <a href="/help" className="hover:text-[#1149C7]">
                  Help & FAQs
                </a>
              </li>
              <li>
                <a href="/user-agreement" className="hover:text-[#1149C7]">
                  User agreement
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">All Care Pros</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a href="/about" className="hover:text-[#1149C7]">
                  About us
                </a>
              </li>
              <li>
                <a href="/careers" className="hover:text-[#1149C7]">
                  Careers
                </a>
              </li>
              <li>
                <a href="/partners" className="hover:text-[#1149C7]">
                  Partners
                </a>
              </li>
              <li>
                <a href="/affiliates" className="hover:text-[#1149C7]">
                  Affiliates
                </a>
              </li>
              <li>
                <a href="/legal" className="hover:text-[#1149C7]">
                  Legal
                </a>
              </li>
              <li>
                <a href="/data-deletion" className="hover:text-[#1149C7]">
                  Data Deletion Request
                </a>
              </li>
            </ul>
          </div>

          {/* Apps + Social */}
          <div className="flex flex-col items-center sm:items-start">
            <h3 className="font-semibold text-gray-900 mb-4">
              Download our apps
            </h3>

            <div className="flex flex-col space-y-3 w-full max-w-[200px]">
              {/* <a className="bg-black text-white px-4 py-2 rounded-lg text-xs text-center hover:bg-gray-800">
                Available on the
                <br />
                <span className="text-sm font-semibold">App Store</span>
              </a> */}

              <a className="bg-black text-white px-4 py-2 rounded-lg text-xs text-center hover:bg-gray-800">
                Android app on
                <br />
                <span className="text-sm font-semibold">Google Play</span>
              </a>
            </div>

            {/* Social Icons */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-center sm:text-left">
                Follow us
              </h3>
              <div className="flex gap-4 justify-center sm:justify-start">
                {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                  <a
                    key={index}
                    href={SOCIAL_LINKS[Icon.displayName]}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-[#1149C7] hover:text-white transition"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-10 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            <p>© 2026 Leadsharing Ltd. All Rights Reserved</p>
            <p>
              Designed & Developed by{" "}
              <a
                href="https://flymediatech.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1149C7] font-medium hover:underline"
              >
                Fly Media Technology
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
