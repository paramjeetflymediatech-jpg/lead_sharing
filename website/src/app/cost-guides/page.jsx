import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return await getSeoMetadata("/cost-guides");
}

export default async function CostGuidesPage() {
    const schema = await getSeoSchema("/cost-guides");

    const costGuides = [
        {
            category: "Plumbing",
            projects: [
                { name: "Fix leaky faucet", range: "$150 - $300" },
                { name: "Replace toilet", range: "$300 - $600" },
                { name: "Water heater installation", range: "$1,200 - $2,500" },
                { name: "Drain cleaning", range: "$200 - $400" }
            ]
        },
        {
            category: "Electrical",
            projects: [
                { name: "Install ceiling fan", range: "$200 - $500" },
                { name: "Electrical panel upgrade", range: "$1,500 - $3,500" },
                { name: "Add outlets/switches", range: "$150 - $300" },
                { name: "Whole house rewiring", range: "$6,000 - $15,000" }
            ]
        },
        {
            category: "Roofing",
            projects: [
                { name: "Roof inspection", range: "$200 - $400" },
                { name: "Shingle repair", range: "$300 - $800" },
                { name: "Complete roof replacement", range: "$8,000 - $20,000" },
                { name: "Gutter installation", range: "$1,000 - $2,500" }
            ]
        },
        {
            category: "Painting & Decorating",
            projects: [
                { name: "Single room painting", range: "$400 - $900" },
                { name: "Exterior house painting", range: "$3,000 - $8,000" },
                { name: "Wallpaper installation", range: "$500 - $1,500" },
                { name: "Cabinet painting", range: "$1,200 - $3,000" }
            ]
        },
        {
            category: "Carpentry",
            projects: [
                { name: "Install kitchen cabinets", range: "$2,000 - $6,000" },
                { name: "Build deck", range: "$5,000 - $15,000" },
                { name: "Install crown molding", range: "$600 - $1,500" },
                { name: "Custom shelving", range: "$500 - $2,000" }
            ]
        },
        {
            category: "General Renovation",
            projects: [
                { name: "Kitchen renovation", range: "$15,000 - $50,000" },
                { name: "Bathroom renovation", range: "$8,000 - $25,000" },
                { name: "Basement finishing", range: "$20,000 - $60,000" },
                { name: "Room addition", range: "$40,000 - $120,000" }
            ]
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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Cost Guides</h1>
                        <p className="text-xl md:text-2xl opacity-90">
                            Transparent pricing information for your home improvement projects across Canada
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="space-y-16">
                        {/* Introduction */}
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Much Will Your Project Cost?</h2>
                            <p className="text-lg text-gray-600">
                                Use our comprehensive cost guides to budget for your next home improvement project. All prices in CAD and based on Canadian market rates.
                            </p>
                        </div>

                        {/* Cost Guides Grid */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Average Project Costs</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {costGuides.map((guide, idx) => (
                                    <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#1149C7] transition-colors">
                                        <h3 className="text-2xl font-bold text-[#1149C7] mb-4">{guide.category}</h3>
                                        <div className="space-y-3">
                                            {guide.projects.map((project, pIdx) => (
                                                <div key={pIdx} className="flex justify-between items-center border-b border-gray-100 pb-2">
                                                    <span className="text-gray-700">{project.name}</span>
                                                    <span className="font-bold text-gray-900">{project.range}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cost Factors */}
                        <div className="bg-blue-50 p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What Affects Project Costs?</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <span className="text-[#1149C7] text-xl">📍</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Location</h3>
                                        <p className="text-gray-600 text-sm">Prices vary between cities - Toronto and Vancouver tend to be higher than smaller cities</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-[#1149C7] text-xl">📐</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Project Size</h3>
                                        <p className="text-gray-600 text-sm">Larger projects generally have better per-unit costs but higher total costs</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-[#1149C7] text-xl">⭐</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Material Quality</h3>
                                        <p className="text-gray-600 text-sm">Premium materials and fixtures increase costs but often provide better longevity</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-[#1149C7] text-xl">⏰</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Timing</h3>
                                        <p className="text-gray-600 text-sm">Peak seasons (spring/summer) may have higher rates due to demand</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-[#1149C7] text-xl">🏠</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Home Condition</h3>
                                        <p className="text-gray-600 text-sm">Older homes may require additional prep work or repairs</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="text-[#1149C7] text-xl">👨‍🔧</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Tradesperson Experience</h3>
                                        <p className="text-gray-600 text-sm">Highly rated professionals may charge premium rates for quality work</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6">
                            <p className="text-gray-700">
                                <strong>Please Note:</strong> These are average estimates for standard projects in Canada. Actual costs may vary based on location, materials, labor rates, and specific project requirements. Always get multiple detailed quotes for accurate pricing.
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="bg-gradient-to-br from-[#1149C7] to-[#0D3A99] text-white p-12 rounded-2xl text-center">
                            <h2 className="text-3xl font-bold mb-4">Get Accurate Quotes for Your Project</h2>
                            <p className="text-xl opacity-90 mb-8">
                                Post your job and receive customized quotes from verified tradespeople in your area
                            </p>
                            <a
                                href="/create-job"
                                className="inline-block bg-white text-[#1149C7] px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Get Free Quotes
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
