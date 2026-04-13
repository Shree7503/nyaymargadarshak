const express = require('express');
const router = express.Router();
const { requestChat, acceptChat, declineChat, getSessions, sendMessage, getMessages } = require('../controllers/chatController');
const { auth } = require('../middleware/auth');

router.post('/request', auth, requestChat);
router.post('/accept/:id', auth, acceptChat);
router.post('/decline/:id', auth, declineChat);
router.get('/sessions', auth, getSessions);
router.post('/messages', auth, sendMessage);
router.get('/messages/:session_id', auth, getMessages);

module.exports = router;
