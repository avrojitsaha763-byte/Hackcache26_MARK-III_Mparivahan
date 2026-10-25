// Vercel Serverless Function: /api/payment/verify
// Verifies transaction and issues statutory Treasury Challan Receipt in Sandbox or Live Mode

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    const {
      orderId,
      amount,
      paymentMode, // 'credit_card' | 'debit_card' | 'upi' | 'netbanking'
      payerDetails = {},
      rtoCode = 'DL-01',
      appNo,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature
    } = body;

    const timestamp = Date.now();
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

    // Cryptographic signature check if live Razorpay secret is configured
    let signatureVerified = false;
    let isLiveGateway = false;

    if (razorpaySecret && razorpayPaymentId && razorpayOrderId && razorpaySignature) {
      try {
        const crypto = await import('crypto');
        const expectedSignature = crypto
          .createHmac('sha256', razorpaySecret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');
        
        if (expectedSignature === razorpaySignature) {
          signatureVerified = true;
          isLiveGateway = true;
        } else {
          return res.status(400).json({ 
            success: false, 
            error: 'Payment signature validation failed. Transaction could not be verified.' 
          });
        }
      } catch (cryptoErr) {
        console.error('Crypto signature verification error:', cryptoErr);
      }
    }

    const txnId = razorpayPaymentId || `TXN-PARIVAHAN-SIM-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;
    const bankRef = razorpayPaymentId 
      ? `RZP-${razorpayPaymentId}` 
      : `BRN-${paymentMode ? paymentMode.toUpperCase().slice(0, 4) : 'EPAY'}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const challanNo = body.challanNo || `GRN-${rtoCode.split('-')[0]}-2026-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const cin = `00024098${Math.floor(100000000 + Math.random() * 900000000)}`;
    const npciUtr = paymentMode === 'upi' ? `UPI/UTR/${timestamp}/${Math.floor(10000000 + Math.random() * 90000000)}` : undefined;

    return res.status(200).json({
      success: true,
      status: isLiveGateway ? 'PAID' : 'PAID (SIMULATED TREASURY CHALLAN)',
      isLiveGateway,
      isDemoSandbox: !isLiveGateway,
      is_demo_mode: !isLiveGateway,
      is_simulated_demo: !isLiveGateway,
      signatureVerified: isLiveGateway ? signatureVerified : 'SIMULATED_TEST_SIGNATURE',
      message: isLiveGateway 
        ? 'Payment verified via payment provider cryptographic signature.'
        : 'CMVR Rule 32 Treasury Challan successfully simulated for hackathon evaluation.',
      receipt: {
        txnId,
        is_demo_mode: !isLiveGateway,
        is_simulated_demo: !isLiveGateway,
        orderId: razorpayOrderId || orderId || `ORD-${timestamp}`,
        challanNo,
        cin,
        bankRef,
        npciUtr,
        razorpayPaymentId: razorpayPaymentId || undefined,
        razorpaySignature: razorpaySignature || undefined,
        paymentMode: paymentMode || 'upi',
        amount: Number(amount || 350),
        currency: 'INR',
        paidAt: new Date().toISOString(),
        payerName: payerDetails.name || 'Demo Applicant',
        payerPhone: (payerDetails.phone || '0000000000').slice(-10),
        bankName: payerDetails.bankName || (paymentMode === 'upi' ? 'NPCI / BHIM Sandbox' : 'State Bank of India (Simulator)'),
        statutoryCitation: 'Central Motor Vehicles Rules 1989, Rule 32 Indicative Fee Schedule',
        applicationNo: appNo || 'DL-2026-PENDING',
        treasuryHead: '0041-Taxes on Vehicles - 101 - Receipts under Motor Vehicles Act (Simulated Ledger)',
        disclaimer: isLiveGateway 
          ? 'Official Treasury receipt generated through verified gateway.'
          : 'DEMO / SANDBOX RECEIPT: Simulated Treasury Challan generated for hackathon demonstration. No real monetary transactions or actual government treasury settlement took place.'
      }
    });
  } catch (err) {
    console.error('Payment verify error:', err);
    return res.status(500).json({ success: false, error: 'Payment verification failed.' });
  }
}
