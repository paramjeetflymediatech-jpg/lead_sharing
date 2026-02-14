import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return await getSeoMetadata("/partners");
}

export default async function PartnersPage() {
    const schema = await getSeoSchema("/partners");
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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Partner With Us</h1>
                        <p className="text-xl md:text-2xl opacity-90">
                            Join forces to create value for tradespeople and homeowners
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="space-y-16">
                        {/* Why Partner */}
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Partner With All Care Pros?</h2>
                            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
                                We're building Canada's leading platform for home services. Partner with us to reach thousands of homeowners and tradespeople.
                            </p>

                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="bg-blue-50 p-8 rounded-2xl">
                                    <div className="w-16 h-16 bg-[#1149C7] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-white text-3xl">📈</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Growing Audience</h3>
                                    <p className="text-gray-600">
                                        Access our rapidly expanding user base of homeowners and professional tradespeople
                                    </p>
                                </div>

                                <div className="bg-blue-50 p-8 rounded-2xl">
                                    <div className="w-16 h-16 bg-[#1149C7] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-white text-3xl">🤝</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Mutual Benefits</h3>
                                    <p className="text-gray-600">
                                        Create win-win partnerships that add value to both our users and your business
                                    </p>
                                </div>

                                <div className="bg-blue-50 p-8 rounded-2xl">
                                    <div className="w-16 h-16 bg-[#1149C7] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-white text-3xl">💼</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Business Growth</h3>
                                    <p className="text-gray-600">
                                        Leverage our platform to expand your reach and grow your business
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Partnership Types */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Partnership Opportunities</h2>

                            <div className="space-y-6">
                                <div className="border-2 border-[#1149C7] rounded-2xl p-8 hover:shadow-lg transition-shadow">
                                    <h3 className="text-2xl font-bold text-[#1149C7] mb-3">Trade Associations</h3>
                                    <p className="text-gray-600 mb-4">
                                        Collaborate to verify and promote qualified tradespeople, ensuring quality standards across our platform.
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                                        <li>Member verification and accreditation</li>
                                        <li>Co-branded marketing initiatives</li>
                                        <li>Industry best practices sharing</li>
                                    </ul>
                                </div>

                                <div className="border-2 border-[#1149C7] rounded-2xl p-8 hover:shadow-lg transition-shadow">
                                    <h3 className="text-2xl font-bold text-[#1149C7] mb-3">Insurance Providers</h3>
                                    <p className="text-gray-600 mb-4">
                                        Offer insurance products and protection services to our users for added peace of mind.
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                                        <li>Insurance product integration</li>
                                        <li>Coverage verification systems</li>
                                        <li>Claims support services</li>
                                    </ul>
                                </div>

                                <div className="border-2 border-[#1149C7] rounded-2xl p-8 hover:shadow-lg transition-shadow">
                                    <h3 className="text-2xl font-bold text-[#1149C7] mb-3">Suppliers & Manufacturers</h3>
                                    <p className="text-gray-600 mb-4">
                                        Connect with tradespeople who need quality materials and tools for their projects.
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                                        <li>Exclusive supplier agreements</li>
                                        <li>Trade discounts for platform users</li>
                                        <li>Product showcase opportunities</li>
                                    </ul>
                                </div>

                                <div className="border-2 border-[#1149C7] rounded-2xl p-8 hover:shadow-lg transition-shadow">
                                    <h3 className="text-2xl font-bold text-[#1149C7] mb-3">Technology Partners</h3>
                                    <p className="text-gray-600 mb-4">
                                        Integrate complementary technologies to enhance our platform capabilities.
                                    </p>
                                    <ul className="list-disc list-inside text-gray-600 space-y-2">
                                        <li>API integrations</li>
                                        <li>White-label solutions</li>
                                        <li>Data sharing agreements</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Current Partners */}
                        <div className="bg-gray-50 p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Current Partners</h2>
                            <p className="text-center text-gray-600 mb-8">
                                We're proud to work with leading organizations in the home services industry
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-32 h-32 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200">
                                        <span className="text-gray-400 text-sm">Partner Logo</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="bg-[#1149C7] text-white p-12 rounded-2xl text-center">
                            <h2 className="text-3xl font-bold mb-4">Interested in Partnering?</h2>
                            <p className="text-xl opacity-90 mb-8">
                                Let's discuss how we can work together to create value
                            </p>
                            <a
                                href="mailto:partnerships@allcarepros.com"
                                className="inline-block bg-white text-[#1149C7] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
                            >
                                Get in Touch
                            </a>
                            <p className="mt-6 opacity-90">
                                Email: partnerships@allcarepros.com
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
