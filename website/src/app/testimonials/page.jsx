import MainLayout from "../main/layout";
import Testimonials from "../components/Testimonials";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export async function generateMetadata() {
    return await getSeoMetadata("/testimonials");
}

export default async function TestimonialsPage() {
    const schema = await getSeoSchema("/testimonials");
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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Customer Testimonials</h1>
                        <p className="text-xl md:text-2xl opacity-90">
                            See what homeowners and tradespeople are saying about All Care Pros
                        </p>
                    </div>
                </section>

                {/* Testimonials Component */}
                <Testimonials />

                {/* CTA Section */}
                <section className="py-16 px-4 bg-gray-50">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Experience It Yourself?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="/jobs"
                                className="bg-[#1149C7] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#0D3A99] transition-colors"
                            >
                                Post a Job
                            </a>
                            <a
                                href="/auth/register?role=TRADESPERSON"
                                className="bg-white text-[#1149C7] border-2 border-[#1149C7] px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors"
                            >
                                Join as Tradesperson
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
