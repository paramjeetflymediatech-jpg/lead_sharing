import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export async function generateMetadata() {
    return await getSeoMetadata("/ask-a-tradesperson");
}

export default async function AskTradespersonPage() {
    const schema = await getSeoSchema("/ask-a-tradesperson");

    const popularQuestions = [
        {
            category: "Plumbing",
            questions: [
                "How much does it cost to fix a leaky faucet?",
                "When should I replace vs repair my water heater?",
                "How do I prevent frozen pipes in winter?"
            ]
        },
        {
            category: "Electrical",
            questions: [
                "Is it safe to add more outlets to my home?",
                "How often should I upgrade my electrical panel?",
                "What are signs I need rewiring?"
            ]
        },
        {
            category: "Roofing",
            questions: [
                "How long should my roof last?",
                "When is the best time to replace a roof?",
                "What are signs of roof damage?"
            ]
        },
        {
            category: "General",
            questions: [
                "How do I choose the right tradesperson?",
                "Should I get multiple quotes?",
                "What questions should I ask before hiring?"
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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Ask a Tradesperson</h1>
                        <p className="text-xl md:text-2xl opacity-90">
                            Get expert answers to your home improvement questions from qualified professionals
                        </p>
                    </div>
                </section>

                {/* Main Content */}
                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="space-y-16">
                        {/* How It Works */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-[#1149C7] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                        1
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Post Your Question</h3>
                                    <p className="text-gray-600">
                                        Describe your home improvement question or concern in detail
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-20 h-20 bg-[#1149C7] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                        2
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Get Expert Answers</h3>
                                    <p className="text-gray-600">
                                        Qualified tradespeople provide professional advice and solutions
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-20 h-20 bg-[#1149C7] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                        3
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Hire with Confidence</h3>
                                    <p className="text-gray-600">
                                        If you need work done, get quotes from verified professionals
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Popular Questions */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Questions</h2>
                            <div className="grid md:grid-cols-2 gap-8">
                                {popularQuestions.map((section, idx) => (
                                    <div key={idx} className="bg-gray-50 p-6 rounded-xl">
                                        <h3 className="text-xl font-bold text-[#1149C7] mb-4">{section.category}</h3>
                                        <ul className="space-y-3">
                                            {section.questions.map((q, qIdx) => (
                                                <li key={qIdx} className="flex items-start gap-2">
                                                    <span className="text-[#1149C7] mt-1">•</span>
                                                    <span className="text-gray-700">{q}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Why Ask on All Care Pros */}
                        <div className="bg-blue-50 p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Ask on All Care Pros?</h2>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl mb-3">✓</div>
                                    <h3 className="font-bold text-gray-900 mb-2">Verified Experts</h3>
                                    <p className="text-gray-600 text-sm">All responses from qualified, checked tradespeople</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl mb-3">⚡</div>
                                    <h3 className="font-bold text-gray-900 mb-2">Fast Responses</h3>
                                    <p className="text-gray-600 text-sm">Get answers within 24-48 hours</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl mb-3">💯</div>
                                    <h3 className="font-bold text-gray-900 mb-2">100% Free</h3>
                                    <p className="text-gray-600 text-sm">No charge for asking questions or getting advice</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="bg-gradient-to-br from-[#1149C7] to-[#0D3A99] text-white p-12 rounded-2xl text-center">
                            <h2 className="text-3xl font-bold mb-4">Ready to Get Expert Advice?</h2>
                            <p className="text-xl opacity-90 mb-8">
                                Post your job and get personalized quotes from verified tradespeople
                            </p>
                            <a
                                href="/create-job"
                                className="inline-block bg-white text-[#1149C7] px-10 py-5 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                Post Your Job Now
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
