// Vercel Serverless Function: /api/auth
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { loginType, phone, username, password, otp } = body;

    // Simulate network latency for realism
    await new Promise((resolve) => setTimeout(resolve, 800));

    // FLOW A: User requests an OTP via Phone Number
    if (loginType === 'request_otp') {
      if (!phone || phone.length < 10) return res.status(400).json({ error: "Invalid phone" });
      return res.status(200).json({ 
        success: true, 
        message: "OTP sent to registered mobile.", 
        txnId: `TXN-${Date.now()}`,
        simulatedOtp: "123456"
      });
    }

    // FLOW B: User submits the OTP
    if (loginType === 'verify_otp') {
      if (otp !== "123456") return res.status(401).json({ error: "Invalid OTP" });
      return res.status(200).json({ success: true, token: "mock_oauth_token_8892" });
    }

    // FLOW C: User logs in with Username & PIN/Password
    if (loginType === 'password') {
      if (username === "demo_user" && password === "123456") {
        return res.status(200).json({ success: true, token: "mock_oauth_token_8892" });
      }
      return res.status(401).json({ error: "Invalid credentials" });
    }

    return res.status(400).json({ error: "Invalid login type" });
  } catch {
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
