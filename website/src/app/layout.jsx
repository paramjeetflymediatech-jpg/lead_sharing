

import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "All Care Pros",
  description: "Find and hire trusted tradespeople in Canada with All Care Pros",
  icons: {
    icon: "/favicon.png",
  },
};

import { AuthProvider } from "@/context/AuthContext";
import { getGlobalSeoSchema } from "@/lib/seo-helper";

export default async function RootLayout({ children }) {
  const globalSchema = await getGlobalSeoSchema();

  return (
    // Add suppressHydrationWarning to the <html> tag
    <html lang="en" suppressHydrationWarning>
      <head>
        {globalSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: globalSchema }}
          />
        )}
      </head>
      <body className="antialiased bg-zinc-50 text-zinc-900" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}