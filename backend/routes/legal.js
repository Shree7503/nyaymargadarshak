const express = require('express');
const router = express.Router();
const { getArticles, getArticleById, getUpdates, getLaws, getLawById, getLawNames } = require('../controllers/legalController');

router.get('/articles', getArticles);
router.get('/articles/:id', getArticleById);
router.get('/updates', getUpdates);
router.get('/laws', getLaws);
router.get('/laws/names', getLawNames);
router.get('/laws/:id', getLawById);

module.exports = router;
