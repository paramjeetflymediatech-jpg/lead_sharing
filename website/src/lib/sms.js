/**
 * SMS Utility Library
 * Handles sending SMS via various providers (Twilio, MSG91, etc.)
 */

export async function sendSMS({ to, message }) {
    console.log(`[SMS Utility] Preparing to send to ${to}: ${message}`);

    const provider = process.env.SMS_PROVIDER || "LOG_ONLY";

    try {
        switch (provider.toUpperCase()) {
            case "TWILIO":
                return await sendTwilioSMS(to, message);
            case "LOG_ONLY":
            default:
                console.log("-----------------------------------------");
                console.log(`📱 MOCK SMS TO: ${to}`);
                console.log(`💬 MESSAGE: ${message}`);
                console.log("-----------------------------------------");
                return { success: true, message: "Logged to console" };
        }
    } catch (error) {
        console.error(`[SMS Utility] Error sending SMS via ${provider}:`, error);
        return { success: false, error: error.message };
    }
}

async function sendTwilioSMS(to, message) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
        throw new Error("Missing Twilio configuration in environment variables");
    }

    try {
        // We use fetch if twilio package is not installed to avoid dependency issues
        // or we can suggest user to npm install twilio
        const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    To: to,
                    From: fromNumber,
                    Body: message,
                }).toString(),
            }
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Twilio API error");
        }

        console.log(`[Twilio] SMS sent successfully. SID: ${data.sid}`);
        return { success: true, sid: data.sid };
    } catch (error) {
        throw error;
    }
}
