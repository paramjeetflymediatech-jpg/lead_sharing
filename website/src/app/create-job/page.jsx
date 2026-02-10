import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export async function generateMetadata() {
    return await getSeoMetadata("/create-job");
}

export default async function CreateJobPage() {
    const schema = await getSeoSchema("/create-job");

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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Post Your Job</h1>
                        <p className="text-xl md:text-2xl opacity-90">
                            Find local, trusted tradespeople in minutes
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="space-y-16">
                        {/* How It Works */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">It's Simple and Free</h2>

                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-[#1149C7] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                        1
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Describe Your Job</h3>
                                    <p className="text-gray-600">
                                        Tell us what needs doing - from plumbing to painting, we've got you covered
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-20 h-20 bg-[#1149C7] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                        2
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Compare Quotes</h3>
                                    <p className="text-gray-600">
                                        Receive quotes from local tradespeople, compare prices and reviews
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-20 h-20 bg-[#1149C7] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                        3
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Hire with Confidence</h3>
                                    <p className="text-gray-600">
                                        Choose the right tradesperson based on reviews, experience, and price
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div className="bg-blue-50 p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Use All Care Pros?</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex gap-4">
                                    <span className="text-[#1149C7] text-2xl flex-shrink-0">✓</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">100% Free for Homeowners</h3>
                                        <p className="text-gray-600 text-sm">No hidden fees, no charges - ever</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <span className="text-[#1149C7] text-2xl flex-shrink-0">✓</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Verified Tradespeople</h3>
                                        <p className="text-gray-600 text-sm">All professionals are checked and verified</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <span className="text-[#1149C7] text-2xl flex-shrink-0">✓</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Real Reviews</h3>
                                        <p className="text-gray-600 text-sm">Genuine feedback from actual customers</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <span className="text-[#1149C7] text-2xl flex-shrink-0">✓</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Local Professionals</h3>
                                        <p className="text-gray-600 text-sm">Find tradespeople in your area</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <span className="text-[#1149C7] text-2xl flex-shrink-0">✓</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">No Obligation</h3>
                                        <p className="text-gray-600 text-sm">Review quotes with no pressure to hire</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <span className="text-[#1149C7] text-2xl flex-shrink-0">✓</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Fast Service</h3>
                                        <p className="text-gray-600 text-sm">Receive quotes within 24-48 hours</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="bg-gradient-to-br from-[#1149C7] to-[#0D3A99] text-white p-12 rounded-2xl text-center">
                            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                            <p className="text-xl opacity-90 mb-8">
                                Post your job now and start receiving quotes from local tradespeople
                            </p>
                            <a
                                href="/jobs"
                                className="inline-block bg-white text-[#1149C7] px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Post a Job Now
                            </a>
                            <p className="mt-6 opacity-90">
                                Takes less than 2 minutes • Completely free
                            </p>
                        </div>

                        {/* Popular Jobs */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Popular Job Categories</h2>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    "Plumbing",
                                    "Electrician",
                                    "Painter & Decorator",
                                    "Carpenter",
                                    "Plasterer",
                                    "Heating Engineer",
                                    "Roofer",
                                    "Gardener"
                                ].map((trade) => (
                                    <a
                                        key={trade}
                                        href="/jobs"
                                        className="bg-white border-2 border-gray-200 p-4 rounded-xl hover:border-[#1149C7] hover:shadow-md transition-all text-center"
                                    >
                                        <span className="font-semibold text-gray-900">{trade}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
