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
import { getGlobalSeoSchema, getGlobalScripts } from "@/lib/seo-helper";

export default async function RootLayout({ children }) {
  const globalSchema = await getGlobalSeoSchema();
  const { headerScripts, footerScripts } = await getGlobalScripts();

  return (
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
        {/* Global Scripts (Header - placed at top of body to avoid head nesting issues) */}
        {headerScripts && (
          <div dangerouslySetInnerHTML={{ __html: headerScripts }} />
        )}

        <AuthProvider>
          {children}
        </AuthProvider>

        {/* Global Scripts (Footer) */}
        {footerScripts && (
          <div dangerouslySetInnerHTML={{ __html: footerScripts }} />
        )}

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