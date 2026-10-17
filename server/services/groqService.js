const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const extractText = async (systemPrompt, userContent) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      stream: false, 
      reasoning_effort: 'medium',
      stop: null
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq extraction error:', error);
    throw new Error('Failed to extract data: ' + error.message);
  }
};

module.exports = { extractText };
