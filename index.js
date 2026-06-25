const { onRequest } = require("firebase-functions/v2/https");

exports.proxy = onRequest({ cors: true }, async (req, res) => {
  // 1. Get the API Key from Firebase Environment Variables
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status500().json({ error: "Missing GEMINI_API_KEY in environment variables." });
  }

  // 2. Set the Model
  const model = "gemini-3.1-flash-lite";
  const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const requestBody = {
      ...req.body, // Flutter က ပို့လိုက်တဲ့ image နဲ့ text
      generationConfig: {
        topP: 0.8,
        topK: 40,
        temperature: 0.1, 
        maxOutputTokens: 500,
        thinkingConfig: {
          thinkingBudget: 0, 
        },
      }
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({ error: "Proxy failed to reach Google" });
  }
});