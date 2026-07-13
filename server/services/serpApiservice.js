const axios = require('axios');

const searchMediaFacts = async (query) => {
  try {
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      throw new Error('SERPAPI_API_KEY is not defined in environment variables');
    }

    const response = await axios.get('https://serpapi.com/search', {
      params: {
        q: query,
        api_key: apiKey,
        engine: 'google',
        num: 10,
      },
    });

    const organicResults = response.data.organic_results || [];
    const organicText = organicResults
      .map((r) => `${r.title || ''} ${r.snippet || ''}`)
      .join(' ');

    const kg = response.data.knowledge_graph || {};
    const kgText = `${kg.title || ''} ${kg.description || ''} ${kg.attributes ? Object.values(kg.attributes).join(' ') : ''}`;

    const relatedQuestions = response.data.related_questions || [];
    const peopleAlsoAskText = relatedQuestions
      .map((q) => `Q: ${q.question} A: ${q.answer || ''}`)
      .join(' ');

    const answerBox = response.data.answer_box || {};
    const answerText = `${answerBox.title || ''} ${answerBox.answer || ''} ${answerBox.snippet || ''}`;

    const images = response.data.images_results || [];
    const imageUrls = images.slice(0, 5).map((img) => img.thumbnail || img.original || img.link).filter(Boolean);

    const fullText = [organicText, kgText, peopleAlsoAskText, answerText].join(' ');

    return { rawText: fullText, images: imageUrls };
  } catch (error) {
    console.error('SERPAPI media search error:', error.message);
    return { rawText: '', images: [] };
  }
};

module.exports = { searchMediaFacts };