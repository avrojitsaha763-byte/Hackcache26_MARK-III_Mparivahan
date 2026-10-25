// Vercel Serverless Function: /api/slots/book
// ADTT (Automated Driving Test Track) Slot Scheduling Engine

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
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

    const timestamp = Date.now();
    const slotId = `ADTT-SLOT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const bookedSlot = {
      slot_id: slotId,
      app_no: body.app_no || 'KA-2026-55319',
      applicant_name: body.applicant_name || 'TEST PERSONA 03: Vikram Singh (Sample Applicant)',
      track_type: body.track_type || 'car',
      ground: body.ground || 'IDTR-DELHI',
      ground_name: body.ground_name || 'Automated Driving Test Track',
      test_date: body.test_date || '2026-11-25',
      slot_time: body.slot_time || '09:30 AM - 11:00 AM',
      booked_at_timestamp: timestamp,
      statutory_compliance: 'CMVR 1989 Rule 15 (Minimum 30-day Form 3 LL Holding Period)',
      status: 'CONFIRMED',
      booked_at: new Date().toISOString()
    };

    return res.status(200).json({
      status: 'success',
      message: 'Practical Driving Test Appointment confirmed on Automated Driving Test Track (ADTT).',
      data: bookedSlot
    });
  } catch (err) {
    console.error('Slot booking error:', err);
    return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
}
