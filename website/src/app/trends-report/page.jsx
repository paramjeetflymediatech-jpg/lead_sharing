import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return await getSeoMetadata("/trends-report");
}

export default async function TrendsReportPage() {
    const schema = await getSeoSchema("/trends-report");

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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Home Improvement Trends Report</h1>
                        <p className="text-xl md:text-2xl opacity-90">
                            Insights and data on the Canadian home services industry
                        </p>
                    </div>
                </section>

                { /* Main Content */}
                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="space-y-16">
                        {/* Introduction */}
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">2026 Canadian Home Services Outlook</h2>
                            <p className="text-lg text-gray-600">
                                Stay ahead of the curve with data-driven insights into what homeowners want and how the trade industry is evolving across Canada.
                            </p>
                        </div>

                        {/* Top Trends */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">🔥 Top Trends for 2026</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="text-4xl">🏡</div>
                                        <h3 className="text-2xl font-bold text-gray-900">Smart Home Integration</h3>
                                    </div>
                                    <p className="text-gray-700 mb-4">
                                        68% of Canadian homeowners are investing in smart home technology, with smart thermostats, security systems, and lighting leading the way.
                                    </p>
                                    <div className="bg-white p-4 rounded-xl">
                                        <p className="text-sm font-bold text-[#1149C7]">Most Requested:</p>
                                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                                            <li>• Smart thermostats (Google Nest, Ecobee)</li>
                                            <li>• Video doorbells and security cameras</li>
                                            <li>• Smart lighting systems</li>
                                            <li>• Voice-controlled assistants</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="text-4xl">♻️</div>
                                        <h3 className="text-2xl font-bold text-gray-900">Sustainable Living</h3>
                                    </div>
                                    <p className="text-gray-700 mb-4">
                                        Environmental consciousness drives 54% of renovation decisions, with energy efficiency being the top priority for Canadian homeowners.
                                    </p>
                                    <div className="bg-white p-4 rounded-xl">
                                        <p className="text-sm font-bold text-green-700">Popular Green Upgrades:</p>
                                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                                            <li>• Solar panel installations (+42% YoY)</li>
                                            <li>• Triple-pane windows</li>
                                            <li>• High-efficiency HVAC systems</li>
                                            <li>• LED lighting retrofits</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="text-4xl">💼</div>
                                        <h3 className="text-2xl font-bold text-gray-900">Home Office Revolution</h3>
                                    </div>
                                    <p className="text-gray-700 mb-4">
                                        With 41% of Canadians working remotely at least part-time, dedicated home office spaces have become a necessity, not a luxury.
                                    </p>
                                    <div className="bg-white p-4 rounded-xl">
                                        <p className="text-sm font-bold text-purple-700">Common Requests:</p>
                                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                                            <li>• Basement office conversions</li>
                                            <li>• Soundproofing installations</li>
                                            <li>• Additional electrical outlets</li>
                                            <li>• Built-in shelving and storage</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="text-4xl">🏞️</div>
                                        <h3 className="text-2xl font-bold text-gray-900">Outdoor Living Expansion</h3>
                                    </div>
                                    <p className="text-gray-700 mb-4">
                                        Canadians are maximizing outdoor space usage, with deck and patio projects up 38% year-over-year despite our climate challenges.
                                    </p>
                                    <div className="bg-white p-4 rounded-xl">
                                        <p className="text-sm font-bold text-orange-700">Trending Projects:</p>
                                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                                            <li>• Covered decks and pergolas</li>
                                            <li>• Outdoor kitchens and BBQ stations</li>
                                            <li>• Fire pits and heating elements</li>
                                            <li>• Weather-resistant furniture storage</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Market Statistics */}
                        <div className="bg-gray-50 p-8 rounded-2xl">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">📊 By The Numbers</h2>
                            <div className="grid md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="text-5xl font-extrabold text-[#1149C7] mb-2">$28K</div>
                                    <p className="text-gray-600">Average renovation budget</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-5xl font-extrabold text-[#1149C7] mb-2">72%</div>
                                    <p className="text-gray-600">Check online reviews first</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-5xl font-extrabold text-[#1149C7] mb-2">3.2</div>
                                    <p className="text-gray-600">Average quotes requested</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-5xl font-extrabold text-[#1149C7] mb-2">89%</div>
                                    <p className="text-gray-600">Prefer licensed tradespeople</p>
                                </div>
                            </div>
                        </div>

                        {/* Regional Insights */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">🍁 Regional Highlights</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-[#1149C7] mb-4">Ontario</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Highest demand: Kitchen renovations</li>
                                        <li>• Average project: $32,000</li>
                                        <li>• Fast-growing: Smart home tech</li>
                                        <li>• Seasonal peak: May-September</li>
                                    </ul>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-[#1149C7] mb-4">British Columbia</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Highest demand: Outdoor decking</li>
                                        <li>• Average project: $29,500</li>
                                        <li>• Fast-growing: Energy efficiency</li>
                                        <li>• Seasonal peak: April-October</li>
                                    </ul>
                                </div>

                                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                                    <h3 className="text-xl font-bold text-[#1149C7] mb-4">Quebec</h3>
                                    <ul className="text-gray-600 space-y-2 text-sm">
                                        <li>• Highest demand: Bathroom renos</li>
                                        <li>• Average project: $24,000</li>
                                        <li>• Fast-growing: Home offices</li>
                                        <li>• Seasonal peak: June-August</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Most In-Demand Trades */}
                        <div className="bg-blue-50 p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Most In-Demand Trades (2026)</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 bg-white p-4 rounded-xl">
                                    <div className="w-10 h-10 bg-[#1149C7] text-white rounded-full flex items-center justify-center font-bold">1</div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">Electricians</h4>
                                        <p className="text-sm text-gray-600">Driven by smart home installations</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white p-4 rounded-xl">
                                    <div className="w-10 h-10 bg-[#1149C7] text-white rounded-full flex items-center justify-center font-bold">2</div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">HVAC Technicians</h4>
                                        <p className="text-sm text-gray-600">Energy-efficient system upgrades</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white p-4 rounded-xl">
                                    <div className="w-10 h-10 bg-[#1149C7] text-white rounded-full flex items-center justify-center font-bold">3</div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">Renovation Contractors</h4>
                                        <p className="text-sm text-gray-600">Kitchen and bathroom remodels</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white p-4 rounded-xl">
                                    <div className="w-10 h-10 bg-[#1149C7] text-white rounded-full flex items-center justify-center font-bold">4</div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900">Deck Builders</h4>
                                        <p className="text-sm text-gray-600">Outdoor living space expansion</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Predictions */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-[#1149C7] p-6">
                            <h3 className="font-bold text-gray-900 mb-3 text-xl">🔮 Looking Ahead: Q2-Q4 2026</h3>
                            <ul className="text-gray-700 space-y-2">
                                <li>• Continued growth in smart home integration projects (+15% expected)</li>
                                <li>• Rising demand for multi-generational home modifications</li>
                                <li>• Increased focus on water conservation and rainwater systems</li>
                                <li>• Growing interest in home battery storage paired with solar</li>
                                <li>• Expansion of 3D virtual consultations for project planning</li>
                            </ul>
                        </div>

                        {/* CTA */}
                        <div className="bg-gradient-to-br from-[#1149C7] to-[#0D3A99] text-white p-12 rounded-2xl text-center">
                            <h2 className="text-3xl font-bold mb-4">Be Part of the Trend</h2>
                            <p className="text-xl opacity-90 mb-8">
                                Whether you're a homeowner planning a project or a tradesperson looking for opportunities, All Care Pros connects you with the right people
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="/create-job"
                                    className="inline-block bg-white text-[#1149C7] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                                >
                                    Post a Job
                                </a>
                                <a
                                    href="/auth/register"
                                    className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-[#1149C7] transition-colors"
                                >
                                    Join as a Tradesperson
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
