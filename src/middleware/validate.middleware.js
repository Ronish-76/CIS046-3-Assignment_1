/**
 * Request Payload Validation and Sanitization Middleware
 */

function validateRegister(req, res, next) {
  let { email, displayName, password } = req.body;

  email = (email || '').trim().toLowerCase();
  displayName = (displayName || '').trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'A valid email address is required.' });
  }

  if (!displayName || displayName.length < 2 || displayName.length > 30) {
    return res.status(400).json({ success: false, error: 'Display name must be between 2 and 30 characters.' });
  }

  if (!/^[a-zA-Z0-9_ ]+$/.test(displayName)) {
    return res.status(400).json({ success: false, error: 'Display name can only contain alphanumeric characters, spaces, and underscores.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters in length.' });
  }

  req.body.email = email;
  req.body.displayName = displayName;
  next();
}

function validateLogin(req, res, next) {
  let { email, password } = req.body;
  email = (email || '').trim().toLowerCase();

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  req.body.email = email;
  next();
}

function validateAnswer(req, res, next) {
  const { answer } = req.body;

  if (answer === undefined || answer === null || String(answer).trim() === '') {
    return res.status(400).json({ success: false, error: 'An answer digit (0-9) is required.' });
  }

  const numericAnswer = parseInt(answer, 10);

  // Allow timeout signal codes (999 or -1) from the game engine
  if (numericAnswer === 999 || numericAnswer === -1) {
    req.body.numericAnswer = 999;
    return next();
  }

  if (isNaN(numericAnswer) || numericAnswer < 0 || numericAnswer > 9) {
    return res.status(400).json({ success: false, error: 'Answer must be a single digit between 0 and 9.' });
  }

  req.body.numericAnswer = numericAnswer;
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateAnswer
};

