import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export async function generateMetadata() {
    return await getSeoMetadata("/affiliates");
}

export default async function AffiliatesPage() {
    const schema = await getSeoSchema("/affiliates");
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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Affiliate Program</h1>
                        <p className="text-xl md:text-2xl opacity-90">
                            Earn money by referring homeowners and tradespeople to All Care Pros
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="space-y-16">
                        {/* How It Works */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Our Affiliate Program Works</h2>

                            <div className="grid md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-[#1149C7] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                        1
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Join Free</h3>
                                    <p className="text-gray-600 text-sm">
                                        Sign up for our affiliate program at no cost
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-20 h-20 bg-[#1149C7] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                        2
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Get Your Link</h3>
                                    <p className="text-gray-600 text-sm">
                                        Receive your unique referral link and marketing materials
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-20 h-20 bg-[#1149C7] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                        3
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Promote</h3>
                                    <p className="text-gray-600 text-sm">
                                        Share your link on your website, blog, or social media
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-20 h-20 bg-[#1149C7] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                        4
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Earn Money</h3>
                                    <p className="text-gray-600 text-sm">
                                        Get paid for every qualified referral you bring
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Commission Structure */}
                        <div className="bg-blue-50 p-8 rounded-2xl">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Commission Structure</h2>

                            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                                <div className="bg-white p-6 rounded-xl border-2 border-[#1149C7]">
                                    <h3 className="text-2xl font-bold text-[#1149C7] mb-2">Homeowner Referrals</h3>
                                    <p className="text-4xl font-extrabold text-gray-900 mb-2">£10</p>
                                    <p className="text-gray-600">Per homeowner who posts their first job</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl border-2 border-[#1149C7]">
                                    <h3 className="text-2xl font-bold text-[#1149C7] mb-2">Tradesperson Referrals</h3>
                                    <p className="text-4xl font-extrabold text-gray-900 mb-2">£25</p>
                                    <p className="text-gray-600">Per tradesperson who completes their first paid subscription</p>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-gray-700 font-semibold">
                                    💰 Plus: Earn 10% recurring commission on tradesperson subscriptions for 12 months!
                                </p>
                            </div>
                        </div>

                        {/* Benefits */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Affiliate Benefits</h2>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                                    <div className="text-4xl mb-4">💸</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Competitive Payouts</h3>
                                    <p className="text-gray-600">
                                        Industry-leading commission rates with no caps on earnings
                                    </p>
                                </div>

                                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                                    <div className="text-4xl mb-4">📊</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Tracking</h3>
                                    <p className="text-gray-600">
                                        Monitor your clicks, conversions, and earnings in real-time
                                    </p>
                                </div>

                                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                                    <div className="text-4xl mb-4">🎨</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Marketing Resources</h3>
                                    <p className="text-gray-600">
                                        Access banners, text links, and promotional content
                                    </p>
                                </div>

                                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                                    <div className="text-4xl mb-4">⚡</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Payments</h3>
                                    <p className="text-gray-600">
                                        Monthly payouts via bank transfer or PayPal
                                    </p>
                                </div>

                                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                                    <div className="text-4xl mb-4">🎯</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Dedicated Support</h3>
                                    <p className="text-gray-600">
                                        Our affiliate team is here to help you succeed
                                    </p>
                                </div>

                                <div className="bg-white border border-gray-200 p-6 rounded-xl">
                                    <div className="text-4xl mb-4">📈</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Performance Bonuses</h3>
                                    <p className="text-gray-600">
                                        Top performers earn special bonuses and higher rates
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Who Should Join */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Perfect For</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex gap-4 items-start">
                                    <span className="text-[#1149C7] text-2xl flex-shrink-0">✓</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Home Improvement Bloggers</h3>
                                        <p className="text-gray-600 text-sm">Share valuable resources with your DIY and home renovation audience</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <span className="text-[#1149C7] text-2xl flex-shrink-0">✓</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Property Websites</h3>
                                        <p className="text-gray-600 text-sm">Help homeowners and landlords find reliable tradespeople</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <span className="text-[#1149C7] text-2xl flex-shrink-0">✓</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Social Media Influencers</h3>
                                        <p className="text-gray-600 text-sm">Monetize your home and lifestyle content</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <span className="text-[#1149C7] text-2xl flex-shrink-0">✓</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Trade Publications</h3>
                                        <p className="text-gray-600 text-sm">Provide value to trade industry professionals</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <span className="text-[#1149C7] text-2xl flex-shrink-0">✓</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Real Estate Agents</h3>
                                        <p className="text-gray-600 text-sm">Recommend trusted tradespeople to your clients</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <span className="text-[#1149C7] text-2xl flex-shrink-0">✓</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Building Forums & Communities</h3>
                                        <p className="text-gray-600 text-sm">Connect community members with quality services</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="bg-gradient-to-br from-[#1149C7] to-[#0D3A99] text-white p-12 rounded-2xl text-center">
                            <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
                            <p className="text-xl opacity-90 mb-8">
                                Join our affiliate program today and start generating income
                            </p>
                            <a
                                href="mailto:affiliates@allcarepros.com?subject=Affiliate Program Application"
                                className="inline-block bg-white text-[#1149C7] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
                            >
                                Apply Now
                            </a>
                            <p className="mt-6 opacity-90 text-sm">
                                Questions? Email us at affiliates@allcarepros.com
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
