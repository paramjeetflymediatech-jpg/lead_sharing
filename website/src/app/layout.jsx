import "./globals.css";

export const metadata = {
  title: "Lead Sharing",
  description: "Find and hire trusted tradespeople in the UK",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-zinc-50 text-zinc-900">
        {children}
      </body>
    </html>
  );
}
