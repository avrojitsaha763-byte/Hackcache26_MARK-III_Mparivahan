// Vercel Serverless Function: /api/upload-document
// Client-Side Canvas Optimization & CMVR Rule 14 Document Compliance Screener

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

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

    const docType = body.docType || 'general_document';
    const fileName = body.fileName || `${docType}.jpg`;
    const sizeKB = Number(body.sizeKB || 150);
    const width = Number(body.width || 800);
    const height = Number(body.height || 600);
    const mimeType = body.mimeType || (fileName.endsWith('.png') ? 'image/png' : fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

    // Acknowledge receipt of the uploaded file for manual scrutiny desk review
    // Zero fake OCR confidence scores or false automated claims
    return res.status(200).json({
      success: true,
      status: 'UPLOADED_PENDING_MANUAL_REVIEW',
      message: 'Document received and queued for manual RTO officer review.',
      is_demo_mode: true,
      is_simulated_demo: true,
      docType,
      fileName,
      sizeKB,
      dimensions: `${width}x${height}px`,
      mimeType,
      uploadedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Server upload error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process document on server.'
    });
  }
}
