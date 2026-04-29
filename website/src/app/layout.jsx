import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "AllCarePros Canada",
  description: "Find and hire trusted tradespeople in Canada",
  icons: {
    icon: "/favicon.png",
  },
};

import { AuthProvider } from "@/context/AuthContext";
import { getGlobalSeoSchema, getGlobalScripts } from "@/lib/seo-helper";

/**
 * Parses a raw HTML string and extracts <meta> and <script> tags
 * Returns them as React-renderable JSX elements for use inside <head>.
 */
function parseHeadTags(rawHtml) {
  if (!rawHtml) return [];

  const elements = [];
  let idx = 0;

  // Extract <meta ... /> or <meta ...>
  const metaRegex = /<meta\s([^>]*)\/?>/gi;
  let match;
  while ((match = metaRegex.exec(rawHtml)) !== null) {
    const attrs = match[1];
    const props = {};
    const attrRegex = /(\w[\w-]*)="([^"]*)"/g;
    let a;
    while ((a = attrRegex.exec(attrs)) !== null) {
      props[a[1]] = a[2];
    }
    elements.push(<meta key={`meta-${idx++}`} {...props} />);
  }

  // Extract <script ...>...</script>
  const scriptRegex = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  while ((match = scriptRegex.exec(rawHtml)) !== null) {
    const attrStr = match[1];
    const innerHtml = match[2];
    const props = {};
    const attrRegex = /(\w[\w-]*)(?:="([^"]*)")?/g;
    let a;
    while ((a = attrRegex.exec(attrStr)) !== null) {
      if (!a[1]) continue;
      if (a[2] !== undefined) props[a[1]] = a[2];
      else props[a[1]] = true; // boolean attrs like `async`
    }
    if (innerHtml.trim()) {
      elements.push(
        <script key={`script-${idx++}`} {...props} dangerouslySetInnerHTML={{ __html: innerHtml }} />
      );
    } else {
      elements.push(<script key={`script-${idx++}`} {...props} />);
    }
  }

  return elements;
}

export default async function RootLayout({ children }) {
  const globalSchema = await getGlobalSeoSchema();
  const { headerScripts, footerScripts } = await getGlobalScripts();

  const headElements = parseHeadTags(headerScripts);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {globalSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: globalSchema }}
          />
        )}
        {headElements}
      </head>
      <body className="antialiased bg-zinc-50 text-zinc-900" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>

        {footerScripts && (
          <div dangerouslySetInnerHTML={{ __html: footerScripts }} suppressHydrationWarning />
        )}

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#363636', color: '#fff' },
            success: {
              duration: 3000,
              iconTheme: { primary: '#10B981', secondary: '#fff' },
            },
            error: {
              duration: 4000,
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}