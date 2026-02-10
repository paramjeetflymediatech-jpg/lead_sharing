import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export async function generateMetadata() {
    return await getSeoMetadata("/user-agreement");
}

export default async function UserAgreementPage() {
    const schema = await getSeoSchema("/user-agreement");
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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">User Agreement</h1>
                        <p className="text-xl opacity-90">
                            Last updated: February 2026
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="max-w-4xl mx-auto px-4 py-16">
                    <div className="prose prose-lg max-w-none space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-600 leading-relaxed">
                                By accessing and using All Care Pros, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                All Care Pros provides a platform that connects homeowners with tradespeople for home improvement and maintenance services. We facilitate:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Job posting and quote requests from homeowners</li>
                                <li>Business lead generation for qualified tradespeople</li>
                                <li>Communication tools and review systems</li>
                                <li>Profile management for both parties</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                You are responsible for:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Maintaining the confidentiality of your account and password</li>
                                <li>All activities that occur under your account</li>
                                <li>Providing accurate and current information</li>
                                <li>Notifying us immediately of any unauthorized use</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Conduct</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                You agree NOT to:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>Post false, inaccurate, or misleading information</li>
                                <li>Impersonate any person or entity</li>
                                <li>Harass, abuse, or harm another person</li>
                                <li>Violate any applicable laws or regulations</li>
                                <li>Interfere with or disrupt the service</li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Payment terms are negotiated directly between homeowners and tradespeople. All Care Pros is not responsible for payment disputes but will assist in mediation where possible. Tradespeople pay fees for lead access as outlined in our pricing structure.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
                            <p className="text-gray-600 leading-relaxed">
                                All Care Pros acts as a marketplace platform only. We do not perform the actual trade services and are not responsible for the quality, safety, legality, or other aspects of work performed by tradespeople. Users engage with each other at their own risk.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Your use of All Care Pros is also governed by our Privacy Policy. We collect, use, and protect your personal information as described in that policy.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Termination</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We reserve the right to terminate or suspend your account at any time for violations of this agreement or for any other reason we deem appropriate, with or without notice.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to Terms</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
                            <p className="text-gray-600 leading-relaxed">
                                For questions about these terms, please contact us at legal@allcarepros.com.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
