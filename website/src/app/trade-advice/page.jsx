import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export async function generateMetadata() {
    return await getSeoMetadata("/trade-advice");
}

export default async function TradeAdvicePage() {
    const schema = await getSeoSchema("/trade-advice");

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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Trade Advice Centre</h1>
                        <p className="text-xl md:text-2xl opacity-90">
                            Professional guidance to help grow and manage your trade business in Canada
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="space-y-16">
                        {/* Business Growth */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Growing Your Trade Business</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] transition-colors">
                                    <div className="text-4xl mb-4">📱</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Digital Presence</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Create a professional website</li>
                                        <li>• Maintain active social media</li>
                                        <li>• Join online platforms like All Care Pros</li>
                                        <li>• Encourage online reviews</li>
                                        <li>• Showcase your best work with photos</li>
                                    </ul>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] transition-colors">
                                    <div className="text-4xl mb-4">⭐</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Customer Service Excellence</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Respond quickly to inquiries</li>
                                        <li>• Communicate clearly and professionally</li>
                                        <li>• Set realistic expectations</li>
                                        <li>• Follow up after job completion</li>
                                        <li>• Request reviews from satisfied clients</li>
                                    </ul>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] transition-colors">
                                    <div className="text-4xl mb-4">💼</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Pricing Strategy</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Research local market rates</li>
                                        <li>• Factor in all costs (materials, labor, overhead)</li>
                                        <li>• Provide detailed, transparent quotes</li>
                                        <li>• Offer tiered service options</li>
                                        <li>• Don't undervalue your expertise</li>
                                    </ul>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] transition-colors">
                                    <div className="text-4xl mb-4">📋</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Standards</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Maintain proper licensing and insurance</li>
                                        <li>• Stay current with building codes</li>
                                        <li>• Invest in quality tools and equipment</li>
                                        <li>• Continue education and training</li>
                                        <li>• Follow safety regulations</li>
                                    </ul>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] transition-colors">
                                    <div className="text-4xl mb-4">🤝</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Networking</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Join local trade associations</li>
                                        <li>• Build relationships with suppliers</li>
                                        <li>• Connect with complementary trades</li>
                                        <li>• Attend industry events</li>
                                        <li>• Build a referral network</li>
                                    </ul>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] transition-colors">
                                    <div className="text-4xl mb-4">📊</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Business Management</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Track income and expenses</li>
                                        <li>• Use project management software</li>
                                        <li>• Maintain organized records</li>
                                        <li>• Plan for seasonal fluctuations</li>
                                        <li>• Consider hiring help as you grow</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Lead Generation Tips */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Maximizing Lead Generation</h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-xl">
                                    <h3 className="text-xl font-bold text-[#1149C7] mb-4">On All Care Pros</h3>
                                    <ul className="space-y-3 text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#1149C7] font-bold">✓</span>
                                            <span>Complete your profile with photos and certifications</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#1149C7] font-bold">✓</span>
                                            <span>Respond to leads within 1-2 hours</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#1149C7] font-bold">✓</span>
                                            <span>Provide detailed, personalized quotes</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#1149C7] font-bold">✓</span>
                                            <span>Ask satisfied clients to leave reviews</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#1149C7] font-bold">✓</span>
                                            <span>Regularly update your availability</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-white p-6 rounded-xl">
                                    <h3 className="text-xl font-bold text-[#1149C7] mb-4">General Marketing</h3>
                                    <ul className="space-y-3 text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#1149C7] font-bold">✓</span>
                                            <span>Use yard signs at active job sites</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#1149C7] font-bold">✓</span>
                                            <span>Invest in vehicle wraps and branding</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#1149C7] font-bold">✓</span>
                                            <span>Leverage word-of-mouth referrals</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#1149C7] font-bold">✓</span>
                                            <span>Share before/after photos on social media</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-[#1149C7] font-bold">✓</span>
                                            <span>Participate in community events</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Common Challenges */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Overcoming Common Challenges</h2>
                            <div className="space-y-4">
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <h3 className="font-bold text-gray-900 mb-2">🌧️ Seasonal Fluctuations</h3>
                                    <p className="text-gray-600 mb-2"><strong>Challenge:</strong> Slow periods during Canadian winters for outdoor trades</p>
                                    <p className="text-gray-600"><strong>Solution:</strong> Diversify services to include indoor work, offer winter specials, plan marketing campaigns for peak season</p>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <h3 className="font-bold text-gray-900 mb-2">⏰ Time Management</h3>
                                    <p className="text-gray-600 mb-2"><strong>Challenge:</strong> Balancing multiple projects and administrative tasks</p>
                                    <p className="text-gray-600"><strong>Solution:</strong> Use scheduling software, batch similar tasks, consider hiring administrative help</p>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <h3 className="font-bold text-gray-900 mb-2">💰 Late Payments</h3>
                                    <p className="text-gray-600 mb-2"><strong>Challenge:</strong> Clients delaying payment or disputing charges</p>
                                    <p className="text-gray-600"><strong>Solution:</strong> Clear contracts, progress payments, automated invoicing, maintain professional communication</p>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <h3 className="font-bold text-gray-900 mb-2">🔄 Finding Consistent Work</h3>
                                    <p className="text-gray-600 mb-2"><strong>Challenge:</strong> Gaps between projects</p>
                                    <p className="text-gray-600"><strong>Solution:</strong> Join platforms like All Care Pros, build referral relationships, maintain marketing presence year-round</p>
                                </div>
                            </div>
                        </div>

                        {/* Success Metrics */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                            <h3 className="font-bold text-gray-900 mb-3">📈 Track Your Success</h3>
                            <p className="text-gray-700 mb-3">Monitor these key performance indicators:</p>
                            <ul className="text-gray-700 space-y-2">
                                <li>• Lead response time (aim for under 2 hours)</li>
                                <li>• Quote-to-job conversion rate (target 30-40%)</li>
                                <li>• Customer satisfaction score (aim for 4.5+ stars)</li>
                                <li>• Repeat customer rate (healthy businesses see 20-30%)</li>
                                <li>• Profit margin per project (track to ensure profitability)</li>
                            </ul>
                        </div>

                        {/* CTA */}
                        <div className="bg-gradient-to-br from-[#1149C7] to-[#0D3A99] text-white p-12 rounded-2xl text-center">
                            <h2 className="text-3xl font-bold mb-4">Grow Your Business with All Care Pros</h2>
                            <p className="text-xl opacity-90 mb-8">
                                Join thousands of tradespeople connecting with homeowners across Canada
                            </p>
                            <a
                                href="/auth/register"
                                className="inline-block bg-white text-[#1149C7] px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Join as a Tradesperson
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
