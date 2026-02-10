import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export async function generateMetadata() {
    return await getSeoMetadata("/about");
}

export default async function AboutPage() {
    const schema = await getSeoSchema("/about");

    return (
        <MainLayout>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schema }}
                />
            )}
            <div className="min-h-screen bg-white">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-[#1149C7] to-[#0D3A99] text-white py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">About All Care Pros</h1>
                        <p className="text-xl md:text-2xl opacity-90">
                            Connecting homeowners with trusted tradespeople across the UK
                        </p>
                    </div>
                </section>

                {/* Story Section */}
                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="flex flex-col md:flex-row gap-12 items-center">
                        <div className="md:w-1/2">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                Founded with a simple mission: to make home improvement stress-free. We realized that finding a reliable plumber, electrician, or builder was often a gamble, while skilled tradespeople struggled to find consistent work.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                All Care Pros bridges that gap. We've built a platform where quality meets convenience, ensuring that every job posting reaches verified professionals who take pride in their work.
                            </p>
                        </div>
                        <div className="md:w-1/2 bg-gray-100 h-64 md:h-96 rounded-2xl flex items-center justify-center">
                            <span className="text-gray-400">Team / Office Image Placeholder</span>
                        </div>
                    </div>
                </section>

                {/* Mission & Values */}
                <section className="bg-zinc-50 py-16 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission & Values</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                We are driven by a commitment to raise the standards of the home services industry through transparency and trust.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-[#1149C7] rounded-lg flex items-center justify-center mb-6">
                                    <span className="text-white text-2xl">🛡️</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Trust First</h3>
                                <p className="text-gray-600">
                                    Every tradesperson is vetted. Every review is genuine. We build relationships on a foundation of verified trust.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-[#1149C7] rounded-lg flex items-center justify-center mb-6">
                                    <span className="text-white text-2xl">⭐</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Quality Guaranteed</h3>
                                <p className="text-gray-600">
                                    We champion excellence. From the smallest repair to major renovations, quality workmanship is non-negotiable.
                                </p>
                            </div>

                            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-[#1149C7] rounded-lg flex items-center justify-center mb-6">
                                    <span className="text-white text-2xl">💷</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Fair Pricing</h3>
                                <p className="text-gray-600">
                                    We believe in transparency. Homeowners get competitive quotes, and tradespeople get fair pay for their skills.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <section className="bg-[#1149C7] text-white py-16 px-4">
                    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold mb-2">50k+</div>
                            <div className="opacity-80">Jobs Posted</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">10k+</div>
                            <div className="opacity-80">Verified Pros</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">98%</div>
                            <div className="opacity-80">Satisfaction Rate</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">24/7</div>
                            <div className="opacity-80">Support</div>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
