require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');
const { attachUserIfPresent } = require('./middleware/auth');
const apiV1Router = require('./routes/api/v1');
const pagesRouter = require('./routes/pages');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// The React app runs on its own dev server (a separate localhost port from
// this API), so the auth cookie is a cross-origin request — CORS must echo
// back the exact origin (not '*') and allow credentials for it to be sent.
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Runs on every request so EJS pages know whether someone's logged in (for
// the navbar) without every single page route repeating this check.
app.use(attachUserIfPresent);

app.use('/api/v1', apiV1Router);
app.use('/', pagesRouter);

app.use((req, res) => {
  res.status(404);
  if (req.originalUrl.startsWith('/api')) {
    return res.json({ error: 'Not found' });
  }
  res.render('error', { statusCode: 404, message: 'Page not found', user: req.user || null });
});

// Must be registered last — Express identifies error-handling middleware
// by its four-argument signature (err, req, res, next).
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RoomEase server listening on http://localhost:${PORT}`);
});

module.exports = app;
