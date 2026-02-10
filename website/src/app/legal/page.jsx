import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export async function generateMetadata() {
    return await getSeoMetadata("/legal");
}

export default async function LegalPage() {
    const schema = await getSeoSchema("/legal");
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
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Legal Information</h1>
                        <p className="text-xl opacity-90">
                            Terms, Privacy, and Legal Notices
                        </p>
                    </div>
                </section>

                {/* Content */}
                <section className="max-w-4xl mx-auto px-4 py-16">
                    <div className="space-y-12">
                        {/* Company Information */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Company Information</h2>
                            <div className="bg-gray-50 p-6 rounded-xl space-y-2">
                                <p className="text-gray-700"><strong>Company Name:</strong> Leadsharing Ltd</p>
                                <p className="text-gray-700"><strong>Trading As:</strong> All Care Pros</p>
                                <p className="text-gray-700"><strong>Registered in:</strong> Canada</p>
                                <p className="text-gray-700"><strong>Company Number:</strong> [Company Registration Number]</p>
                                <p className="text-gray-700"><strong>VAT Number:</strong> [VAT Number]</p>
                            </div>
                        </div>

                        {/* Legal Documents */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Legal Documents</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <a href="/user-agreement" className="block bg-white border-2 border-[#1149C7] p-6 rounded-xl hover:shadow-lg transition-shadow">
                                    <h3 className="text-xl font-bold text-[#1149C7] mb-2">User Agreement</h3>
                                    <p className="text-gray-600">Terms and conditions for using our platform</p>
                                </a>
                                <a href="/privacy-policy" className="block bg-white border-2 border-[#1149C7] p-6 rounded-xl hover:shadow-lg transition-shadow">
                                    <h3 className="text-xl font-bold text-[#1149C7] mb-2">Privacy Policy</h3>
                                    <p className="text-gray-600">How we collect and protect your data</p>
                                </a>
                                <a href="/cookie-policy" className="block bg-white border-2 border-[#1149C7] p-6 rounded-xl hover:shadow-lg transition-shadow">
                                    <h3 className="text-xl font-bold text-[#1149C7] mb-2">Cookie Policy</h3>
                                    <p className="text-gray-600">Information about cookies we use</p>
                                </a>
                                <a href="/acceptable-use" className="block bg-white border-2 border-[#1149C7] p-6 rounded-xl hover:shadow-lg transition-shadow">
                                    <h3 className="text-xl font-bold text-[#1149C7] mb-2">Acceptable Use</h3>
                                    <p className="text-gray-600">Guidelines for platform usage</p>
                                </a>
                            </div>
                        </div>

                        {/* Intellectual Property */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
                            <p className="text-gray-600 leading-relaxed">
                                All content on this website, including text, graphics, logos, images, and software, is the property of Leadsharing Ltd or its content suppliers and is protected by Canadian and international copyright laws.
                            </p>
                        </div>

                        {/* Disclaimers */}
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Disclaimers</h2>
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        <strong>Platform Nature:</strong> All Care Pros is a marketplace platform that connects homeowners with independent tradespeople. We do not employ tradespeople and are not responsible for the work they perform.
                                    </p>
                                </div>
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        <strong>User Responsibility:</strong> Users are responsible for verifying the credentials, insurance, and qualifications of tradespeople before hiring them.
                                    </p>
                                </div>
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        <strong>Limitation of Liability:</strong> To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from use of our platform.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="bg-blue-50 p-8 rounded-2xl">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Inquiries</h2>
                            <p className="text-gray-600 mb-4">
                                For legal matters, compliance questions, or to report concerns, please contact our legal team:
                            </p>
                            <p className="text-gray-700">
                                <strong>Email:</strong> <a href="mailto:legal@allcarepros.com" className="text-[#1149C7] hover:underline">legal@allcarepros.com</a>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    );
}
