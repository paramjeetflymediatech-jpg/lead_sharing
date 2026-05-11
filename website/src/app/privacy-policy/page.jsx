import MainLayout from "../main/layout";
import { getSeoMetadata, getSeoSchema } from "@/lib/seo-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    return await getSeoMetadata("/privacy-policy");
}

export default async function PrivacyPolicyPage() {
    const schema = await getSeoSchema("/privacy-policy");

    return (
        <MainLayout>
            {schema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: schema }}
                />
            )}
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-8 pb-4 border-b">Privacy Policy</h1>
                    
                    <div className="space-y-8 text-gray-600 leading-relaxed">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
                            <p>
                                At All Care Pros, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and our website.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information Collection</h2>
                            <p>
                                We collect information that you provide directly to us when you create an account, such as your name, email address, phone number, and professional details (for tradespeople).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Device Permissions</h2>
                            <p>
                                To provide our services via the mobile app, we request specific permissions to enhance your experience:
                            </p>
                            <ul className="list-disc ml-6 mt-2 space-y-1">
                                <li><strong>Camera:</strong> We use the camera permission to allow you to take and upload profile pictures, project photos for job postings, and verification documents. We only access the camera when you explicitly initiate a photo-taking action within the app.</li>
                                <li><strong>Photo Gallery/Storage:</strong> To allow you to select and upload existing photos from your device for your profile or job listings.</li>
                                <li><strong>Notifications:</strong> To send you real-time updates about your jobs, new leads (for tradespeople), and messages.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Safety</h2>
                            <p>
                                We do not sell your personal data to third parties. We only collect data necessary for the service to function (Account Info, Photos you upload, and basic device info for security). We do not record audio (the Microphone permission has been removed) or track your location in the background.
                            </p>
                        </section>

                        {/* <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Payment Integration</h2>
                            <p>
                                We use Stripe, a third-party payment processor, to handle credit purchases and transactions. We do not store your credit card or sensitive financial information on our servers. All transactions are processed securely through Stripe's encrypted platform.
                            </p>
                        </section> */}

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Use of Information</h2>
                            <p>
                                We use the information we collect to provide, maintain, and improve our services, to facilitate connections between homeowners and care professionals, and to send you technical notices and support messages.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data Sharing</h2>
                            <p>
                                We share information between homeowners and tradespeople only to the extent necessary to facilitate the service requests. We do not sell your personal data to third parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Data Security</h2>
                            <p>
                                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide, please be aware that no security measures are perfect.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Account Deletion</h2>
                            <p>
                                You have the right to request the deletion of your account and associated data. You can do this through the "Privacy & Security" section in the app settings or by contacting our support team.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Changes to This Policy</h2>
                            <p>
                                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:gurmukhdhatt505@gmail.com" className="text-[#1149C7] hover:underline">gurmukhdhatt505@gmail.com</a>.
                            </p>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t text-sm text-gray-400 text-center">
                        Last Updated: March 2026
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
