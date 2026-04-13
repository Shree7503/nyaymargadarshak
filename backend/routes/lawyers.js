const express = require('express');
const router = express.Router();
const { getAllLawyers, getLawyerById, getMyProfile, upsertProfile, getContactLogs, getContactStats } = require('../controllers/lawyerController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', getAllLawyers);
router.get('/me/profile', auth, requireRole('lawyer'), getMyProfile);
router.get('/me/contacts', auth, requireRole('lawyer'), getContactLogs);
router.get('/me/stats', auth, requireRole('lawyer'), getContactStats);
router.get('/:id', getLawyerById);
router.post('/profile', auth, requireRole('lawyer'), upsertProfile);
router.put('/profile', auth, requireRole('lawyer'), upsertProfile);

module.exports = router;
