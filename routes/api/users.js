const router = require('express').Router();
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const mailer = require('nodemailer');
const crypto = require('crypto');

// Load DB models
const User = require('../../models/User');
const FriendRequest = require('../../models/FriendRequest');
const ShoppingList = require('../../models/ShoppingList');

// Load validation
const isEmpty = require('../../validation/isEmpty');
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');
const validateForgotInput = require('../../validation/forgot');
const validatePasswordResetInput = require('../../validation/reset');

// Routes

// @route   POST /register
// @desc    User registration
// @access  Public
router.post('/register', (req, res) => {
    // Validate form input
    const { errors, isValid } = validateRegisterInput(req.body);
    if (!isValid) {
        res.status(400).json(errors);
    }

    Promise.all([
        User.findOne({ username: req.body.username }),
        User.findOne({ email: req.body.email })
    ])
        .then(users => {
            // Check if username and email already exist in database
            if (users[0]) {
                errors.name = 'Username already exists';
            }
            if (users[1]) {
                errors.email = 'Email already registered';
            }
            if (!isEmpty(errors)) {
                res.status(400).json(errors);
            } else {
                // If username and email are both unique then create a new user entry
                const newUser = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password
                });

                // Hash password and save entry to database
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    });
                });
            }
        })
        .catch(err => console.log(err));
});

// @route   POST /login
// @desc    User login
// @access  Public
router.post('/login', (req, res) => {
    // Validate form input
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
        res.status(400).json(errors);
    }

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username })
        .then(user => {
            if (!user) {
                errors.username = 'Invalid login details';
                res.status(400).json(errors);
            } else {
                bcrypt
                    .compare(password, user.password)
                    .then(isMatch => {
                        if (isMatch) {
                            const payload = {
                                id: user.id,
                                username: user.username
                            };

                            jwt.sign(
                                payload,
                                keys.secretOrKey,
                                { expiresIn: 86400 },
                                (err, token) => {
                                    if (err)
                                        res.status(500).json({
                                            server: 'Something went wrong'
                                        });
                                    res.json({
                                        success: true,
                                        token: 'Bearer ' + token
                                    });
                                }
                            );
                        } else {
                            // Wrong password generates same error message as wrong username
                            errors.username = 'Invalid login details';
                            res.status(400).json(errors);
                        }
                    })
                    .catch();
            }
        })
        .catch(err => console.log(err));
});

// @route   DELETE /current
// @desc    Remove current user from the database
// @access  Private
router.delete(
    '/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        ShoppingList.find({
            author: req.user.id
        })
            .then(lists => {
                if (lists && lists.length > 0) {
                    lists.forEach(list => {
                        list.remove();
                    });
                }
            })
            .then(() => {
                FriendRequest.find({
                    participants: req.user.id
                }).then(requests => {
                    if (requests && requests.length > 0) {
                        requests.forEach(request => {
                            request.remove();
                        });
                    }
                });
            })
            .then(() => {
                User.findByIdAndDelete(req.user.id).then(() => {
                    res.json({
                        success: 'User successfully deleted'
                    });
                });
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({
                    serverError: 'Something went wrong'
                });
            });
    }
);

// @route   GET /current
// @desc    Return the current user
// @access  Private
router.get(
    '/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({
            id: req.user.id,
            username: req.user.username,
            email: req.user.email
        });
    }
);

// @route   GET /:user_id
// @desc    Return the user with a matching id
// @access  Private
router.get(
    '/find/:user_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        User.findById({ _id: req.params.user_id })
            .then(user => {
                if (!user) {
                    res.status(404).json({
                        nouser: 'No user found with that id'
                    });
                } else {
                    res.json({
                        id: user.id,
                        username: user.username
                    });
                }
            })
            .catch(err => console.log(err));
    }
);

// @route   POST /forgotPassword
// @desc    Make a request to reset the password of an account
// @access  Public
router.post('/forgotPassword', (req, res) => {
    const { errors, isValid } = validateForgotInput(req.body);
    if (!isValid) {
        res.status(400).json(errors);
    }
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                // Generate a password reset token
                crypto.randomBytes(20, (err, buf) => {
                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            serverError: 'Something went seriously wrong'
                        });
                    }
                    const token = buf.toString('hex');

                    // Update user record with new token and expiry
                    user.passwordResetToken = token;
                    user.passwordResetTokenExpiry = Date.now() + 360000;
                    user.save();

                    // Send that email!
                    const transporter = mailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: keys.email.user,
                            pass: keys.email.pass
                        }
                    });

                    const mailOptions = {
                        from: keys.email.user,
                        to: req.body.email,
                        subject: 'Password reset request',
                        text:
                            'You have received this email because someone has requested a password reset for your account.\n' +
                            'If you did not initiate this request please ignore the following\n\n' +
                            'Click the link below (or type it into the URL bar) to authorise the password reset:\n' +
                            `http://localhost:3000/reset/${token}\n\n` +
                            'this link will expire within 1 hour of receiving this email'
                    };

                    transporter.sendMail(mailOptions, (err, info) => {
                        if (err) {
                            console.log(err);
                            res.status(500).json({
                                serverError: 'Something went seriously wrong'
                            });
                        } else {
                            res.json({
                                response:
                                    'An email has been sent to the specified address. ' +
                                    'If you have not received the email please make sure you have entered the address correctly ' +
                                    'and that it is not being caught by your spam filter'
                            });
                        }
                    });
                });
            } else {
                errors.email = 'Specified email not found';
                res.status(400).json(errors);
            }
        })
        .catch(err => console.log(err));
});

// @route   POST /forgotPassword/:token
// @desc    Set a new password after password reset request
// @access  Public
router.post('/forgotPassword/:token', (req, res) => {
    const { errors, isValid } = validatePasswordResetInput(req.body);
    if (!isValid) {
        res.status(400).json(errors);
        return;
    } else {
        const token = req.params.token;
        User.findOne({ passwordResetToken: token })
            .then(user => {
                if (user) {
                    if (!user.passwordResetToken) {
                        // Sanitisation should prevent this from being reachable but just in case
                        res.status(404).json({
                            noToken: 'No token found for this user'
                        });
                    }
                    // Check that token is still valid
                    if (Date.now() > user.passwordResetTokenExpiry) {
                        res.status(400).json({
                            tokenExpired:
                                'Token has expired. Please request another password reset'
                        });
                        return;
                    } else {
                        // Reset password and token then update database
                        bcrypt.genSalt(10, (err, salt) => {
                            if (err) {
                                res.status(500).json({
                                    serverError:
                                        'Something went seriously wrong'
                                });
                                return;
                            }
                            bcrypt.hash(
                                req.body.password,
                                salt,
                                (err, hash) => {
                                    if (err) {
                                        res.status(500).json({
                                            serverError:
                                                'Something went seriously wrong'
                                        });
                                        return;
                                    }
                                    user.passwordResetToken = undefined;
                                    user.passwordResetTokenExpiry = undefined;
                                    user.password = hash;
                                    user.save()
                                        .then(user =>
                                            res.json({
                                                success:
                                                    'Password set successfully'
                                            })
                                        )
                                        .catch(err => console.log(err));
                                }
                            );
                        });
                    }
                } else {
                    res.status(400).json({
                        invalidToken: 'Token provided is invalid'
                    });
                }
            })
            .catch(err => console.log(err));
    }
});

// @route   GET /friends
// @desc    Retrieve list of accepted friend requests and return them
// @access  Private
router.get(
    '/friends',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        FriendRequest.find({
            participants: req.user.id,
            accepted: true
        }).then(requests => {
            if (!requests || requests.length < 1) {
                res.status(404).json({
                    noFriends: 'You have no friends :('
                });
            } else {
                res.json(requests);
            }
        });
    }
);

// @route   GET /requests
// @desc    Retrieve list of pending friend requests for the current user
// @access  Private
router.get(
    '/requests',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        FriendRequest.find({
            to: req.user.id,
            pending: true
        })
            .then(requests => {
                if (!requests || requests.length < 1) {
                    res.status(404).json({
                        noRequests: 'You have no pending friend requests'
                    });
                    return;
                }
                res.json(requests);
            })
            .catch(err => console.log(err));
    }
);

// @route   PUT /add/:user_id
// @desc    Send a friend request to the user with the specified `user_id`
// @access  Private
router.post(
    '/add/:user_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        // Sanitise req.params.user_id

        // Reject attempts to add self
        if (req.params.user_id === req.user.id) {
            res.status(400).json({ no: `Don't even try` });
            return;
        }

        // Find user with matching id
        User.findById(req.params.user_id).then(user => {
            if (!user) {
                res.status(404).json({ noUser: 'No user found with that id' });
            } else {
                // Look for existing friend request (accepted or otherwise) between participants before creating a new friend request document
                FriendRequest.findOne({
                    participants: { $all: [req.params.user_id, req.user.id] }
                }).then(request => {
                    if (request) {
                        console.log(request);
                        res.status(400).json({
                            alreadySent: 'Request already exists'
                        });
                        return;
                    } else {
                        const newFriendRequest = new FriendRequest({
                            participants: [req.user.id, req.params.user_id],
                            from: req.user.id,
                            to: req.params.user_id,
                            accepted: false
                        });

                        newFriendRequest
                            .save()
                            .then(newRequest => res.json(newRequest))
                            .catch(err => console.log(err));
                    }
                });
            }
        });
    }
);

// @route   POST /accept/:request_id
// @desc    Accept a friend request
// @acess   Private
router.post(
    '/accept/:request_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        FriendRequest.findById(req.params.request_id).then(request => {
            if (!request) {
                res.status(404).json({
                    noRequest: 'No request found with that id'
                });
                return;
            }

            if (request.to.toString() !== req.user.id) {
                res.status(401).json({
                    Unauthorised: 'Unauthorised'
                });
                return;
            }

            if (!request.pending) {
                res.status(400).json({
                    invalidRequest: 'Request cannot be answered twice'
                });
                return;
            }

            request.accepted = true;
            request.acceptedDate = Date.now();
            request.pending = false;
            request.save().then(response => {
                res.json(response);
                return;
            });
        });
    }
);

// @route   POST /reject/:request_id
// @desc    Reject a friend request
// @acess   Private
router.delete(
    '/reject/:request_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        FriendRequest.findById(req.params.request_id).then(request => {
            if (!request) {
                res.status(404).json({
                    noRequest: 'No request found with that id'
                });
                return;
            }

            if (request.to.toString() !== req.user.id) {
                res.status(401).json({
                    Unauthorised: 'Unauthorised'
                });
                return;
            }

            request
                .remove()
                .then(() => {
                    res.json({ success: 'Friend request ignored' });
                })
                .catch(err => console.log(err));
        });
    }
);

// @route   /unfriend/:user_id
// @desc    Remove user from friends list
// @access  Private
router.delete(
    '/unfriend/:user_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        // to-do
        // sanitise user input (on all routes)

        FriendRequest.findOneAndDelete({
            participants: { $all: [req.user.id, req.params.user_id] },
            pending: false
        })
            .then(request => {
                if (!request) {
                    res.status(404).json({
                        notFriends: 'You are not friends with this user'
                    });
                    return;
                }
                const friendId = request.participants.filter(user => {
                    return user.toString() !== req.user.id;
                });
                res.json(friendId);
            })
            .catch(err => console.log(err));
    }
);

module.exports = router;
