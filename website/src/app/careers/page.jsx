import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return await getSeoMetadata("/careers");
}

export default async function CareersPage() {
    const schema = await getSeoSchema("/careers");
    // const openPositions = [
    //     {
    //         title: "Full Stack Developer",
    //         department: "Engineering",
    //         location: "Remote / Toronto",
    //         type: "Full-time"
    //     },
    //     {
    //         title: "Customer Success Manager",
    //         department: "Customer Support",
    //         location: "Toronto",
    //         type: "Full-time"
    //     },
    //     {
    //         title: "Marketing Manager",
    //         department: "Marketing",
    //         location: "Remote / Vancouver",
    //         type: "Full-time"
    //     },
    //     {
    //         title: "Product Designer",
    //         department: "Design",
    //         location: "Remote",
    //         type: "Full-time"
    //     }
    // ];

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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Join Our Team</h1>
                        <p className="text-xl md:text-2xl opacity-90">
                            Help us revolutionize the home services industry
                        </p>
                    </div>
                </section>

                {/* Why Join Us */}
                <section className="max-w-6xl mx-auto px-4 py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why All Care Pros?</h2>
                        <p className="text-lg text-gray-600">
                            We're building something meaningful - a platform that genuinely helps people
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#1149C7] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white text-2xl">💡</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
                            <p className="text-gray-600">
                                Work on cutting-edge technology and solve real-world problems
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#1149C7] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white text-2xl">🌱</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Growth</h3>
                            <p className="text-gray-600">
                                Continuous learning opportunities and career development
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-[#1149C7] rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white text-2xl">🤝</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Culture</h3>
                            <p className="text-gray-600">
                                Collaborative, supportive team environment with work-life balance
                            </p>
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-blue-50 p-8 rounded-2xl mb-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Benefits & Perks</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <span className="text-[#1149C7] text-xl">✓</span>
                                <span className="text-gray-700">Competitive salary and equity options</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-[#1149C7] text-xl">✓</span>
                                <span className="text-gray-700">Flexible working hours and remote options</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-[#1149C7] text-xl">✓</span>
                                <span className="text-gray-700">Health insurance and wellness programs</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-[#1149C7] text-xl">✓</span>
                                <span className="text-gray-700">Professional development budget</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-[#1149C7] text-xl">✓</span>
                                <span className="text-gray-700">25 days holiday plus bank holidays</span>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-[#1149C7] text-xl">✓</span>
                                <span className="text-gray-700">Modern tech stack and tools</span>
                            </div>
                        </div>
                    </div>

                    {/* Open Positions */}
                    {/* <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Open Positions</h2>
                        <div className="space-y-4">
                            {openPositions.map((job, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                                <span>📁 {job.department}</span>
                                                <span>📍 {job.location}</span>
                                                <span>⏰ {job.type}</span>
                                            </div>
                                        </div>
                                        <a
                                            href="mailto:careers@allcarepros.com"
                                            className="bg-[#1149C7] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0D3A99] transition-colors text-center"
                                        >
                                            Apply Now
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div> */}

                    {/* CTA */}
                    <div className="mt-16 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Don't See a Perfect Fit?</h2>
                        <p className="text-gray-600 mb-6">
                            We're always looking for talented people.  Send us your CV anyway!
                        </p>
                        <a
                            href="mailto:careers@allcarepros.com"
                            className="inline-block bg-[#1149C7] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0D3A99] transition-colors"
                        >
                            Get in Touch
                        </a>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
