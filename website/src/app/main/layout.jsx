import Footer from "../components/footer/page";
import Header from "../components/header/page";
export default function MainLayout({ children }) {
  return (
    <>
      <Header />

      <div className="relative min-h-screen w-full overflow-hidden bg-white font-sans transition-colors dark:bg-[#000000]">
        {/* Unique UI Element: Animated background glow */}
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-[#155DFC] opacity-10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] h-[30%] w-[30%] rounded-full bg-[#155DFC] opacity-5 blur-[100px]" />

        <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-20 lg:flex-row lg:gap-12">
          {/* Left Column: Hero Text */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:w-1/2">
            <div className="mb-4 inline-flex items-center rounded-full bg-[#155DFC]/10 px-3 py-1 text-sm font-medium text-[#155DFC] ring-1 ring-inset ring-[#155DFC]/20">
              Trusted by 50,000+ Homeowners
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight text-black dark:text-white sm:text-7xl">
              Find trusted <span className="text-[#155DFC]">tradespeople</span>
            </h1>

            <p className="mt-8 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-xl">
              The UK's most reliable platform to connect with local
              professionals. Post your project in seconds and get verified
              quotes.
            </p>

            <div className="mt-10 flex flex-col w-full gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <a
                href="/auth/register?role=HOMEOWNER"
                className="group relative flex items-center justify-center overflow-hidden rounded-xl bg-[#155DFC] px-8 py-4 text-sm font-bold text-white transition-all hover:bg-[#1149c7] hover:ring-2 hover:ring-[#155DFC] hover:ring-offset-2"
              >
                Post a Job for Free
              </a>
              <a
                href="/auth/register?role=TRADESPERSON"
                className="flex items-center justify-center rounded-xl border-2 border-zinc-200 px-8 py-4 text-sm font-bold text-black transition-all hover:border-[#155DFC] hover:text-[#155DFC] dark:border-zinc-800 dark:text-white"
              >
                Join as Tradesperson
              </a>
            </div>

            <div className="mt-8">
              <a
                href="/auth/login"
                className="text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white"
              >
                Already have an account?{" "}
                <span className="underline decoration-[#155DFC] underline-offset-4">
                  Log in
                </span>
              </a>
            </div>
          </div>

          {/* Right Column: Unique Visual UI (Trust Cards) */}
          <div className="mt-16 lg:mt-0 lg:w-1/2 grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-200/50 transition-transform hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none">
                <div className="h-10 w-10 rounded-lg bg-[#155DFC]/10 flex items-center justify-center text-[#155DFC] mb-4">
                  🛡️
                </div>
                <h3 className="font-bold dark:text-white">Verified Pros</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Every trader is background checked.
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-200/50 transition-transform hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 mb-4">
                  ⭐
                </div>
                <h3 className="font-bold dark:text-white">Rated & Reviewed</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Real feedback from local neighbors.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-xl shadow-zinc-200/50 transition-transform hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900/50 dark:shadow-none">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 mb-4">
                  ⚡
                </div>
                <h3 className="font-bold dark:text-white">Quick Quotes</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Get responses in under 24 hours.
                </p>
              </div>
              <div className="rounded-2xl border border-[#155DFC]/20 bg-[#155DFC]/5 p-6 shadow-xl transition-transform hover:-translate-y-1 dark:bg-[#155DFC]/10">
                <div className="h-10 w-10 rounded-lg bg-[#155DFC] flex items-center justify-center text-white mb-4">
                  🇬🇧
                </div>
                <h3 className="font-bold dark:text-white">UK Nationwide</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Covering London to Edinburgh.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
