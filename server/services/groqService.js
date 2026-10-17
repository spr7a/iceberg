const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const extractText = async (systemPrompt, userContent) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      model: 'llama3-70b-8192',
      temperature: 0.1,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq extraction error:', error);
    throw new Error('Failed to extract data: ' + error.message);
  }
};

module.exports = { extractText };
