const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

const {
  saveMediaDossier,
  getMyMediaLibrary,
  getMediaDossierById,
  checkIfSaved,
  deleteMediaDossier,
} = require('../controllers/libraryController');
router.use(protect);
router.route('/media')
  .post(saveMediaDossier)
  .get(getMyMediaLibrary);

// GET    /api/library/media/check/:title  - Check if a specific title is already saved
router.get('/media/check/:title', checkIfSaved);
router.route('/media/:id')
  .get(getMediaDossierById)
  .delete(deleteMediaDossier);

module.exports = router;