// Vercel Serverless Function: /api/payment
// Consolidates Order Creation and Signature / Sandbox Treasury Verification

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

  const url = req.url || '';
  const subpath = (req.query.subpath || '').toLowerCase();
  const isCreateOrder = url.includes('/create-order') || subpath === 'create-order';

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    body = body || {};

    // ROUTE 1: Create Order (/api/payment/create-order)
    if (isCreateOrder) {
      const amount = Number(body.amount || 350);
      const applicantName = body.applicantName || 'Demo Applicant';
      const rtoCode = body.rtoCode || 'DL-01';
      const vehicleClass = body.vehicleClass || 'LMV';

      const timestamp = Date.now();
      const orderId = `ORD-PARIVAHAN-${timestamp}-${Math.floor(1000 + Math.random() * 9000)}`;
      const challanNo = `GRN-${rtoCode.split('-')[0]}-2026-${Math.floor(10000000 + Math.random() * 90000000)}`;

      const hasLiveRazorpay = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
      const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_51GovTreasuryLL';
      const razorpayOrderId = `order_${timestamp.toString().slice(-14)}`;

      return res.status(200).json({
        success: true,
        orderId,
        challanNo,
        razorpayKeyId,
        razorpayOrderId,
        amount,
        currency: 'INR',
        isLiveGateway: hasLiveRazorpay,
        isDemoSimulator: !hasLiveRazorpay,
        is_demo_mode: !hasLiveRazorpay,
        is_simulated_demo: !hasLiveRazorpay,
        gatewayMode: hasLiveRazorpay ? 'LIVE_PROVIDER' : 'DEMO_SANDBOX_SIMULATOR',
        merchantName: 'Ministry of Road Transport and Highways (MoRTH - Sandbox Simulator)',
        portalName: 'Sarathi Parivahan National Gateway (Simulator)',
        statutoryRule: 'Central Motor Vehicles Rules 1989, Rule 32 Indicative Fee Schedule',
        disclaimer: 'Sandbox simulation of Government of India Treasury Challan generation under CMVR Rule 32. No real financial debit occurs.',
        beneficiary: {
          accountName: 'Pay and Accounts Officer (MoRTH - Simulated)',
          rtoCode,
          vehicleClass,
          applicantName
        },
        supportedModes: ['credit_card', 'debit_card', 'upi', 'netbanking'],
        createdAt: new Date().toISOString()
      });
    }

    // ROUTE 2: Verify Payment (/api/payment/verify)
    const {
      orderId,
      amount,
      paymentMode,
      payerDetails = {},
      rtoCode = 'DL-01',
      appNo,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature
    } = body;

    const timestamp = Date.now();
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;

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
    console.error('Payment error:', err);
    return res.status(500).json({ success: false, error: 'Payment processing failed.' });
  }
}
