import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return await getSeoMetadata("/homeowner-advice");
}

export default async function HomeownerAdvicePage() {
    const schema = await getSeoSchema("/homeowner-advice");

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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Homeowner Advice Centre</h1>
                        <p className="text-xl md:text-2xl opacity-90">
                            Expert tips and guides to help you maintain, improve, and protect your home
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="space-y-16">
                        {/* Top Tips */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Essential Homeowner Tips</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] transition-colors">
                                    <div className="text-4xl mb-4">🔍</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Hiring the Right Tradesperson</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Check credentials and insurance</li>
                                        <li>• Read reviews and ratings</li>
                                        <li>• Get multiple quotes</li>
                                        <li>• Ask for references</li>
                                        <li>• Get everything in writing</li>
                                    </ul>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] transition-colors">
                                    <div className="text-4xl mb-4">📋</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">DIY vs Hiring a Pro</h3>
                                    <p className="text-gray-600 mb-3 text-sm"><strong>DIY Projects:</strong></p>
                                    <ul className="text-gray-600 space-y-1 text-sm mb-3">
                                        <li>• Painting rooms</li>
                                        <li>• Basic landscaping</li>
                                        <li>• Minor repairs</li>
                                    </ul>
                                    <p className="text-gray-600 mb-2 text-sm"><strong>Hire a Pro:</strong></p>
                                    <ul className="text-gray-600 space-y-1 text-sm">
                                        <li>• Electrical work</li>
                                        <li>• Plumbing</li>
                                        <li>• Structural changes</li>
                                    </ul>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] transition-colors">
                                    <div className="text-4xl mb-4">💰</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Budgeting for Projects</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Add 10-20% contingency</li>
                                        <li>• Prioritize essential repairs</li>
                                        <li>• Plan for seasonal projects</li>
                                        <li>• Consider long-term value</li>
                                        <li>• Get detailed quotes</li>
                                    </ul>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] transition-colors">
                                    <div className="text-4xl mb-4">🏠</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Home Maintenance</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Clean gutters twice yearly</li>
                                        <li>• Test smoke detectors monthly</li>
                                        <li>• Service HVAC annually</li>
                                        <li>• Inspect roof annually</li>
                                        <li>• Seal windows before winter</li>
                                    </ul>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] transition-colors">
                                    <div className="text-4xl mb-4">⚠️</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Red Flags to Watch For</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Demands full payment upfront</li>
                                        <li>• No written contract</li>
                                        <li>• Pressure tactics</li>
                                        <li>• No business address</li>
                                        <li>• Cash-only payments</li>
                                    </ul>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] transition-colors">
                                    <div className="text-4xl mb-4">✅</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Project Success Tips</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Clear communication</li>
                                        <li>• Realistic timelines</li>
                                        <li>• Regular check-ins</li>
                                        <li>• Document everything</li>
                                        <li>• Final walkthrough</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Seasonal Maintenance */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Seasonal Maintenance Checklist</h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-xl">
                                    <h3 className="text-xl font-bold text-[#1149C7] mb-4">🌸 Spring</h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li>✓ Inspect roof for winter damage</li>
                                        <li>✓ Clean and repair gutters</li>
                                        <li>✓ Check exterior drainage</li>
                                        <li>✓ Service air conditioning</li>
                                        <li>✓ Power wash exterior</li>
                                    </ul>
                                </div>

                                <div className="bg-white p-6 rounded-xl">
                                    <h3 className="text-xl font-bold text-[#1149C7] mb-4">☀️ Summer</h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li>✓ Inspect and seal driveway</li>
                                        <li>✓ Check deck/patio condition</li>
                                        <li>✓ Trim trees near house</li>
                                        <li>✓ Clean window screens</li>
                                        <li>✓ Check irrigation system</li>
                                    </ul>
                                </div>

                                <div className="bg-white p-6 rounded-xl">
                                    <h3 className="text-xl font-bold text-[#1149C7] mb-4">🍂 Fall</h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li>✓ Clean gutters again</li>
                                        <li>✓ Winterize outdoor faucets</li>
                                        <li>✓ Service heating system</li>
                                        <li>✓ Seal windows and doors</li>
                                        <li>✓ Chimney inspection/cleaning</li>
                                    </ul>
                                </div>

                                <div className="bg-white p-6 rounded-xl">
                                    <h3 className="text-xl font-bold text-[#1149C7] mb-4">❄️ Winter</h3>
                                    <ul className="space-y-2 text-gray-700">
                                        <li>✓ Check insulation in attic</li>
                                        <li>✓ Prevent ice dams on roof</li>
                                        <li>✓ Test carbon monoxide detectors</li>
                                        <li>✓ Keep walkways clear and safe</li>
                                        <li>✓ Monitor for frozen pipes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Energy Efficiency */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Energy Efficiency Tips</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-5xl mb-3">💡</div>
                                    <h3 className="font-bold text-gray-900 mb-2">Lighting</h3>
                                    <p className="text-gray-600 text-sm">Switch to LED bulbs to save up to 75% on lighting costs</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-5xl mb-3">🌡️</div>
                                    <h3 className="font-bold text-gray-900 mb-2">Heating/Cooling</h3>
                                    <p className="text-gray-600 text-sm">Install a programmable thermostat to reduce energy use by 10-30%</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-5xl mb-3">🪟</div>
                                    <h3 className="font-bold text-gray-900 mb-2">Insulation</h3>
                                    <p className="text-gray-600 text-sm">Proper insulation can cut heating/cooling costs by 15-20%</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="bg-gradient-to-br from-[#1149C7] to-[#0D3A99] text-white p-12 rounded-2xl text-center">
                            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Home Project?</h2>
                            <p className="text-xl opacity-90 mb-8">
                                Connect with verified tradespeople who can help maintain and improve your home
                            </p>
                            <a
                                href="/create-job"
                                className="inline-block bg-white text-[#1149C7] px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Find Tradespeople
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
