// Vercel Serverless Function: /api/quiz/submit
// Evaluates STALL quiz answers against CMVR Rule 11 statutory standards (60% pass mark)

const ANSWER_KEY = {
  "1": 2, // Stop
  "2": 0, // Give Way
  "3": 1, // Driver and all passengers
  "4": 1, // Ascending vehicle
  "5": 1, // BIS ISI helmet
  "6": 1, // Traffic inside roundabout
  "7": 1, // 30mg per 100ml
  "8": 0  // Compulsory ahead
};

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

    const answers = body.answers || {};
    const total = Object.keys(answers).length;
    let score = 0;

    Object.entries(answers).forEach(([qId, chosenIdx]) => {
      const correctIdx = ANSWER_KEY[String(qId)];
      if (correctIdx !== undefined && correctIdx === Number(chosenIdx)) {
        score++;
      }
    });

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const passMark = Math.max(1, Math.ceil(total * 0.6)); // 60% threshold
    const passed = percentage >= 60;

    return res.status(200).json({
      status: 'success',
      score,
      total,
      percentage,
      passed,
      pass_mark: passMark,
      statutory_threshold: '60% under CMVR 1989 Rule 11',
      evaluation_summary: passed
        ? `Passed STALL Knowledge Test with ${percentage}%. Candidate is qualified for Form 3 LL issuance upon officer scrutiny.`
        : `Score (${percentage}%) is below statutory 60% requirement. Remedial study on traffic signs recommended.`
    });
  } catch (err) {
    console.error('Quiz submit error:', err);
    return res.status(500).json({ status: 'error', error: 'Internal Server Error' });
  }
}
