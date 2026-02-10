import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export async function generateMetadata() {
    return await getSeoMetadata("/inspiration");
}

export default async function InspirationPage() {
    const schema = await getSeoSchema("/inspiration");

    const inspirationCategories = [
        {
            title: "Kitchen Transformations",
            description: "Modern kitchen upgrades that add value and functionality",
            ideas: [
                "White shaker cabinets with quartz countertops",
                "Open shelving for a contemporary look",
                "Smart appliances and under-cabinet lighting",
                "Kitchen islands with built-in storage"
            ],
            budgetRange: "$15,000 - $50,000"
        },
        {
            title: "Bathroom Makeovers",
            description: "Spa-like bathroom designs for relaxation",
            ideas: [
                "Walk-in rainfall showers",
                "Double vanity with floating sinks",
                "Heated floors for Canadian winters",
                "Freestanding bathtubs as centerpieces"
            ],
            budgetRange: "$8,000 - $25,000"
        },
        {
            title: "Outdoor Living Spaces",
            description: "Extend your living area to the outdoors",
            ideas: [
                "Composite decking with built-in seating",
                "Pergolas with retractable canopies",
                "Outdoor kitchens and fire pits",
                "Landscaped patios with ambient lighting"
            ],
            budgetRange: "$5,000 - $30,000"
        },
        {
            title: "Basement Finishing",
            description: "Turn unused space into functional living areas",
            ideas: [
                "Home theaters with surround sound",
                "Guest suites with full bathrooms",
                "Home gyms and rec rooms",
                "Home offices with natural lighting"
            ],
            budgetRange: "$20,000 - $60,000"
        },
        {
            title: "Curb Appeal Upgrades",
            description: "Make a great first impression",
            ideas: [
                "Stone or brick accent walls",
                "Modern front door with smart locks",
                "Landscaped gardens with native plants",
                "Exterior lighting for safety and ambiance"
            ],
            budgetRange: "$3,000 - $15,000"
        },
        {
            title: "Energy-Efficient Improvements",
            description: "Save money while helping the environment",
            ideas: [
                "Triple-pane windows for better insulation",
                "Solar panels and battery storage",
                "Smart thermostats and LED lighting",
                "High-efficiency HVAC systems"
            ],
            budgetRange: "$5,000 - $40,000"
        }
    ];

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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Inspiration Centre</h1>
                        <p className="text-xl md:text-2xl opacity-90">
                            Discover amazing home renovation ideas and transform your vision into reality
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="space-y-16">
                        {/* Introduction */}
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Turn Your Dream Home Into Reality</h2>
                            <p className="text-lg text-gray-600">
                                Whether you're planning a small update or a major renovation, find inspiration for every room in your home. Browse popular projects and get ideas for your next improvement.
                            </p>
                        </div>

                        {/* Inspiration Categories */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Project Ideas</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {inspirationCategories.map((category, idx) => (
                                    <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] hover:shadow-lg transition-all">
                                        <h3 className="text-2xl font-bold text-[#1149C7] mb-2">{category.title}</h3>
                                        <p className="text-gray-600 mb-4">{category.description}</p>
                                        <ul className="space-y-2 mb-4">
                                            {category.ideas.map((idea, iIdx) => (
                                                <li key={iIdx} className="flex items-start gap-2">
                                                    <span className="text-[#1149C7] mt-1">✓</span>
                                                    <span className="text-gray-700">{idea}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="pt-4 border-t border-gray-200">
                                            <span className="text-sm text-gray-500">Typical Budget: </span>
                                            <span className="font-bold text-gray-900">{category.budgetRange}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Trending Now */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">🔥 Trending in Canada</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-xl">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Home Integration</h3>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Voice-activated lighting, smart thermostats, and automated window treatments
                                    </p>
                                    <span className="inline-block bg-[#1149C7] text-white text-xs px-3 py-1 rounded-full">
                                        High Demand
                                    </span>
                                </div>

                                <div className="bg-white p-6 rounded-xl">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Multifunctional Spaces</h3>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Home offices that convert to guest rooms, murphy beds, and flexible layouts
                                    </p>
                                    <span className="inline-block bg-[#1149C7] text-white text-xs px-3 py-1 rounded-full">
                                        Growing Trend
                                    </span>
                                </div>

                                <div className="bg-white p-6 rounded-xl">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Sustainable Materials</h3>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Reclaimed wood, bamboo flooring, and eco-friendly paints and finishes
                                    </p>
                                    <span className="inline-block bg-[#1149C7] text-white text-xs px-3 py-1 rounded-full">
                                        Eco-Conscious
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Budget-Friendly Updates */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Budget-Friendly Updates</h2>
                            <div className="grid md:grid-cols-4 gap-6">
                                <div className="text-center bg-gray-50 p-6 rounded-xl">
                                    <div className="text-4xl mb-3">🎨</div>
                                    <h3 className="font-bold text-gray-900 mb-2">Fresh Paint</h3>
                                    <p className="text-gray-600 text-sm mb-2">New colors transform any room</p>
                                    <p className="text-[#1149C7] font-bold">Under $500</p>
                                </div>

                                <div className="text-center bg-gray-50 p-6 rounded-xl">
                                    <div className="text-4xl mb-3">💡</div>
                                    <h3 className="font-bold text-gray-900 mb-2">New Fixtures</h3>
                                    <p className="text-gray-600 text-sm mb-2">Update lighting and hardware</p>
                                    <p className="text-[#1149C7] font-bold">$300 - $1,000</p>
                                </div>

                                <div className="text-center bg-gray-50 p-6 rounded-xl">
                                    <div className="text-4xl mb-3">🌿</div>
                                    <h3 className="font-bold text-gray-900 mb-2">Landscaping</h3>
                                    <p className="text-gray-600 text-sm mb-2">Add plants and mulch</p>
                                    <p className="text-[#1149C7] font-bold">$200 - $800</p>
                                </div>

                                <div className="text-center bg-gray-50 p-6 rounded-xl">
                                    <div className="text-4xl mb-3">🪟</div>
                                    <h3 className="font-bold text-gray-900 mb-2">New Curtains</h3>
                                    <p className="text-gray-600 text-sm mb-2">Refresh window treatments</p>
                                    <p className="text-[#1149C7] font-bold">$150 - $600</p>
                                </div>
                            </div>
                        </div>

                        {/* Planning Tips */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                            <h3 className="font-bold text-gray-900 mb-3">💡 Planning Your Project?</h3>
                            <ul className="text-gray-700 space-y-2">
                                <li>• Create a detailed vision board with your favorite ideas</li>
                                <li>• Set a realistic budget with 15-20% contingency</li>
                                <li>• Get multiple quotes from verified tradespeople</li>
                                <li>• Consider the ROI - which projects add the most value?</li>
                                <li>• Think about timing - some projects are best done in specific seasons</li>
                            </ul>
                        </div>

                        {/* CTA */}
                        <div className="bg-gradient-to-br from-[#1149C7] to-[#0D3A99] text-white p-12 rounded-2xl text-center">
                            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Dream Project?</h2>
                            <p className="text-xl opacity-90 mb-8">
                                Post your project and get custom quotes from verified tradespeople in your area
                            </p>
                            <a
                                href="/create-job"
                                className="inline-block bg-white text-[#1149C7] px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Get Started Today
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
