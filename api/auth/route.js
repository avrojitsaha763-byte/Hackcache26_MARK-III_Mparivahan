import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { loginType, phone, username, password, otp } = body;

    // Simulate network latency for realism
    await new Promise((resolve) => setTimeout(resolve, 800));

    // FLOW A: User requests an OTP via Phone Number
    if (loginType === 'request_otp') {
      const cleanPhone = (phone || '').toString().replace(/\D/g, '');
      if (!cleanPhone || cleanPhone.length < 10) {
        return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
      }
      return NextResponse.json({ 
        success: true, 
        message: "OTP Sent"
      });
    }

    // FLOW B: User submits the OTP (accepts demo 123456 or any 6-digit OTP entered by reviewer)
    if (loginType === 'verify_otp') {
      if (!otp || (otp !== "123456" && otp.length !== 6)) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
      }
      return NextResponse.json({ success: true, token: "mock_oauth_token_8892" });
    }

    // FLOW C: User logs in with Username & PIN/Password
    if (loginType === 'password') {
      if (username === "demo_user" && password === "123456") {
        return NextResponse.json({ success: true, token: "mock_oauth_token_8892" });
      }
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    return NextResponse.json({ error: "Invalid login type" }, { status: 400 });

  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
