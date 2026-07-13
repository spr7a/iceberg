const { fetchCoreIdentity } = require('../services/mediaService');
const { generateSimpleDossier, getTrendingQueries } = require('../services/simpleDossierService');

const getCoreIdentity = async (req, res, next) => {
  try {
    const { type, query } = req.body;

    if (!type || !query) {
      return res.status(400).json({ 
        message: 'Both type and query are required',
        required: ['type', 'query']
      });
    }

    const validTypes = ['movie', 'tv', 'show', 'music', 'song', 'album', 'game', 'games', 'book', 'books'];
    if (!validTypes.includes(type.toLowerCase())) {
      return res.status(400).json({ 
        message: `Invalid type. Supported types: ${validTypes.join(', ')}` 
      });
    }

    const coreIdentity = await fetchCoreIdentity(type, query);

    if (!coreIdentity) {
      return res.status(404).json({ 
        message: `No results found for "${query}" in ${type} category` 
      });
    }

    res.status(200).json({
      success: true,
      data: coreIdentity,
    });
  } catch (error) {
    if (error.response) {
      return res.status(502).json({
        message: 'External API error',
        details: error.response.data || error.message,
      });
    }
    next(error);
  }
};

const getSimpleDossierHandler = async (req, res) => {
  const { type, query } = req.body;

  if (!type || !query) {
    return res.status(400).json({ error: 'Type and query are required.' });
  }

  try {
    const { dossier, images } = await generateSimpleDossier(type, query);
    res.status(200).json({ dossier, images });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate dossier.' });
  }
};

const getTrendingHandler = async (req, res) => {
  try {
    const trending = await getTrendingQueries();
    res.status(200).json({ trending });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trending queries.' });
  }
};

module.exports = {
  getCoreIdentity,
  getSimpleDossierHandler,
  getTrendingHandler,
};
