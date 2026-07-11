const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth'); // JWT auth

const {
  createCandidate,
  getCandidates
} = require('../controllers/candidateController');

// Protected routes: only logged-in users can register or list candidates
router.post('/', auth, createCandidate);
router.get('/', auth, getCandidates);

module.exports = router;
