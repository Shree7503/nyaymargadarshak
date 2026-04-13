const express = require('express');
const router = express.Router();
const { sendContact, getMyContacts } = require('../controllers/contactController');
const { auth } = require('../middleware/auth');

router.post('/', auth, sendContact);
router.get('/', auth, getMyContacts);

module.exports = router;
