import MainLayout from "../main/layout";
import ServiceDirectory from "../components/ServiceDirectory";

export const metadata = {
    title: "Service Directory | Local Tradespeople in Canada",
    description: "Browse our comprehensive directory of local tradespeople across Canada. Find reliable professionals for plumbing, electrical, roofing, and more in your neighborhood.",
    keywords: "local tradespeople canada, service directory, home improvement pros, vetted tradespeople"
};

export default function DirectoryPage() {
    return (
        <MainLayout>
            <ServiceDirectory />
        </MainLayout>
    );
}
