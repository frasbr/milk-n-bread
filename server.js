const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

// Import routes
const users = require('./routes/api/users');
const lists = require('./routes/api/lists');

// Initialise express server
const app = express();

// Body parser middleware - Buffers http response stream into js object
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => console.log('Successfully connected to database'))
    .catch(err => console.log(err));

// Helmet middleware sets content headers for security purposes
app.use(helmet());

// Sanitisation middleware
app.use(
    mongoSanitize({
        replaceWith: '_'
    })
);

// Passport middleware for authenticating private routes
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

// Use routes
app.use('/api/users', users);
app.use('/api/lists', lists);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
