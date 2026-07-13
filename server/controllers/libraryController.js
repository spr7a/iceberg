const MediaLibrary = require('../models/MediaLibrary');

const saveMediaDossier = async (req, res, next) => {
  try {
    const { mediaType, title, imageUrl, releaseYear, dossierText } = req.body;
    const userId = req.user.id;

    if (!mediaType || !title || !dossierText) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: mediaType, title, and dossierText are required.',
      });
    }

    const existing = await MediaLibrary.findOne({
      user: userId,
      title: { $regex: new RegExp(`^${title}$`, 'i') },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'Already saved',
        saved: true,
        id: existing._id,
        dossier: existing,
      });
    }

    const saved = await MediaLibrary.create({
      user: userId,
      mediaType,
      title: title.trim(),
      imageUrl: imageUrl || null,
      releaseYear: releaseYear || null,
      dossierText,
    });

    res.status(201).json({
      success: true,
      message: 'Dossier saved successfully',
      saved: true,
      dossier: saved,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        message: 'Already saved',
        saved: true,
      });
    }
    next(error);
  }
};

const getMyMediaLibrary = async (req, res, next) => {
  try {
    const library = await MediaLibrary.find({ user: req.user.id })
      .sort({ savedAt: -1 });

    res.status(200).json({
      success: true,
      count: library.length,
      library,
    });
  } catch (error) {
    next(error);
  }
};

const getMediaDossierById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dossier = await MediaLibrary.findById(id);

    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier not found',
      });
    }

    if (dossier.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this dossier',
      });
    }

    dossier.lastViewed = new Date();
    await dossier.save();

    res.status(200).json({
      success: true,
      dossier,
    });
  } catch (error) {
    next(error);
  }
};

const checkIfSaved = async (req, res, next) => {
  try {
    const { title } = req.params;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title parameter is required',
      });
    }

    const existing = await MediaLibrary.findOne({
      user: req.user.id,
      title: { $regex: new RegExp(`^${title}$`, 'i') },
    });

    res.status(200).json({
      success: true,
      saved: !!existing,
      id: existing?._id || null,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMediaDossier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dossier = await MediaLibrary.findById(id);

    if (!dossier) {
      return res.status(404).json({
        success: false,
        message: 'Dossier not found',
      });
    }

    if (dossier.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this dossier',
      });
    }

    await dossier.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Dossier removed successfully',
      deleted: true,
      id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveMediaDossier,
  getMyMediaLibrary,
  getMediaDossierById,
  checkIfSaved,
  deleteMediaDossier,
};