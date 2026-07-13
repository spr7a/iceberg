const express = require('express');
const router = express.Router();
const { getCoreIdentity, getSimpleDossierHandler, getTrendingHandler } = require('../controllers/mediaController');

router.post('/core-identity', getCoreIdentity);
router.post('/dossier-simple', getSimpleDossierHandler);
router.get('/trending', getTrendingHandler);

module.exports = router;
