// import "./globals.css";

// export const metadata = {
//   title: "Lead Sharing",
//   description: "Find and hire trusted tradespeople in the UK",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className="antialiased bg-zinc-50 text-zinc-900">
//         {children}
//       </body>
//     </html>
//   );
// }

import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Lead Sharing",
  description: "Find and hire trusted tradespeople in the UK",
};

export default function RootLayout({ children }) {
  return (
    // Add suppressHydrationWarning to the <html> tag
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-zinc-50 text-zinc-900" suppressHydrationWarning>
        {children}
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