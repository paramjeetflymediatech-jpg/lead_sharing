
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const payment = searchParams.get("payment");
  const sessionId = searchParams.get("session_id");

  // Redirect back to the app using custom scheme
  let redirectUrl = `allcarepros://tradesperson?payment=${payment}`;
  if (sessionId) {
    redirectUrl += `&session_id=${sessionId}`;
  }
  console.log("Mobile redirect triggered:", { payment, sessionId, redirectUrl });

  return new NextResponse(
    `<html>
      <head>
        <title>Redirecting...</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script>
          console.log("Attempting redirect to:", "${redirectUrl}");
          window.onload = function() {
            setTimeout(function() {
              window.location.href = "${redirectUrl}";
            }, 500);
          };
        </script>
      </head>
      <body style="background-color: #f3f4f6; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: -apple-system, sans-serif;">
        <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); text-align: center; max-width: 90%;">
          <h2 style="color: #111827; margin-bottom: 1rem;">Payment ${payment === 'success' ? 'Successful!' : 'Cancelled'}</h2>
          <p style="color: #4b5563; margin-bottom: 2rem;">Redirecting you back to the All Care Pros app...</p>
          <a href="${redirectUrl}" style="background-color: #2563eb; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; display: inline-block;">
            Open App
          </a>
          <p style="font-size: 0.875rem; color: #9ca3af; margin-top: 1.5rem;">If the app doesn't open automatically, please click the button above.</p>
        </div>
      </body>
    </html>`,
    {
      headers: { "Content-Type": "text/html" },
    }
  );
}
