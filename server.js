const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = express();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Dummy user
const users = [
  { id: 1, username: 'admin', password: 'password' }
];

// Local strategy
passport.use(new LocalStrategy((username, password, done) => {
  const user = users.find(u => u.username === username && u.password === password);
  return user ? done(null, user) : done(null, false);
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// Login route (Noncompliant: missing session.regenerate)
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    // Noncompliant - no session.regenerate after login
    res.redirect('/');
  });

// Routes
app.get('/', (req, res) => {
  res.send(req.isAuthenticated() ? 'Logged in' : 'Not logged in');
});

app.get('/login', (req, res) => {
  res.send(`<form method="post" action="/login">
              <input type="text" name="username" placeholder="Username" />
              <input type="password" name="password" placeholder="Password" />
              <button type="submit">Login</button>
            </form>`);
});

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
