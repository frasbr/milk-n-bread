const router = require('express').Router();
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
        return;
    }

    const username = req.body.username
        .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
        .toLowerCase();

    Promise.all([
        User.findOne({ username: username }),
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
                return;
            }

            // If username and email are both unique then create a new user entry
            const newUser = new User({
                username: username,
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
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                serverError: 'Something went wrong'
            });
        });
});

// @route   POST /login
// @desc    User login
// @access  Public
router.post('/login', (req, res) => {
    // Validate form input
    const { errors, isValid } = validateLoginInput(req.body);
    if (!isValid) {
        res.status(400).json(errors);
        return;
    }

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ username })
        .then(user => {
            if (!user) {
                errors.username = 'Invalid login details';
                res.status(400).json(errors);
            } else {
                bcrypt.compare(password, user.password).then(isMatch => {
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
                                if (err) {
                                    res.status(500).json({
                                        server: 'Something went wrong'
                                    });
                                    return;
                                }
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
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                serverError: 'Something went wrong'
            });
        });
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
                        _id: user._id,
                        username: user.username
                    });
                }
            })
            .catch(err => console.log(err));
    }
);

// @route   POST /search/
// @desc    Search for a user by username
// @access  Private
router.post(
    '/search',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        if (!req.body.search) {
            res.status(400).json({
                search: 'Please enter a username to search for'
            });
            return;
        }
        const query = req.body.search
            .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
            .toLowerCase();
        User.find({ username: query }).then(users => {
            if (!users || users.length < 1) {
                res.status(404).json({ noUsers: 'No users found' });
                return;
            }

            res.json(
                users.map(user => {
                    return {
                        id: user._id,
                        username: user.username
                    };
                })
            );
        });
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
                            token: 'No token found for this user'
                        });
                    }
                    // Check that token is still valid
                    if (Date.now() > user.passwordResetTokenExpiry) {
                        res.status(400).json({
                            token:
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
        })
            .populate('participants')
            .then(requests => {
                if (!requests || requests.length < 1) {
                    res.status(404).json({
                        noFriends: 'You have no friends :('
                    });
                } else {
                    const friendsList = requests.map(request => {
                        // 1 - index of the current user will point to the index of the friended user
                        // as the participants array can only have 2 members
                        const friendIndex =
                            1 -
                            request.participants
                                .map(p => p._id.toString())
                                .indexOf(req.user.id);

                        const friend = request.participants[friendIndex];
                        return {
                            id: friend._id,
                            username: friend.username
                        };
                    });
                    res.json(friendsList);
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
            participants: req.user.id,
            pending: true
        })
            .populate('to')
            .populate('from')
            .then(requests => {
                if (!requests || requests.length < 1) {
                    res.status(404).json({
                        noRequests: 'You have no pending friend requests'
                    });
                    return;
                }
                res.json(
                    requests.map(request => {
                        return {
                            id: request._id,
                            from: request.from.username,
                            fromId: request.from._id,
                            to: request.to.username,
                            toId: request.to._id,
                            incoming: request.to._id.toString() === req.user.id
                        };
                    })
                );
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ serverError: 'Something went wrong' });
            });
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
                        // If request is pending and incoming then accept the request
                        if (
                            request.pending &&
                            !request.accepted &&
                            request.from.toString() !== req.user.id
                        ) {
                            request.pending = false;
                            request.accepted = true;
                            request
                                .save()
                                .then(updatedRequest => {
                                    updatedRequest
                                        .populate('from')
                                        .execPopulate()
                                        .then(populatedRequest => {
                                            res.json({
                                                id: populatedRequest._id,
                                                user: {
                                                    id:
                                                        populatedRequest.from
                                                            ._id,
                                                    username:
                                                        populated.from.username
                                                },
                                                accepted: true
                                            });
                                        });
                                })
                                .catch(err => {
                                    console.log(err);
                                    res.status(500).json({
                                        serverError: 'Something went wrong'
                                    });
                                });
                        } else {
                            // Otherwise it's either already been answered or it was sent by the current user
                            res.status(400).json({
                                alreadySent: 'Request already exists'
                            });
                        }
                        return;
                    } else {
                        // If no request exists already then create a new one
                        const newFriendRequest = new FriendRequest({
                            participants: [req.user.id, req.params.user_id],
                            from: req.user.id,
                            to: req.params.user_id,
                            accepted: false
                        });

                        newFriendRequest
                            .save()
                            .then(newRequest => {
                                newRequest
                                    .populate('to')
                                    .execPopulate()
                                    .then(populatedRequest => {
                                        res.json({
                                            id: populatedRequest._id,
                                            to: populatedRequest.to.username,
                                            from: req.user.username,
                                            incoming: false
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
                    invalidRequest: "Request isn't pending"
                });
                return;
            }

            request.accepted = true;
            request.acceptedDate = Date.now();
            request.pending = false;
            request
                .save()
                .then(acceptedRequest => {
                    res.json(acceptedRequest._id);
                    console.log(acceptedRequest._id);
                    return;
                })
                .catch(err => {
                    res.status(500).json({
                        serverError: 'Something went wrong'
                    });
                    console.log(err);
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

            if (request.participants.indexOf(req.user.id) < 0) {
                res.status(401).json({
                    Unauthorised: 'Unauthorised'
                });
                return;
            }

            request
                .remove()
                .then(removedRequest => {
                    res.json(removedRequest._id);
                })
                .catch(err => {
                    res.status(500).json({
                        serverError: 'Something went wrong'
                    });
                    console.log(err);
                });
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
        if (req.user.id === req.params.user_id) {
            res.status(400).json({
                no: 'no'
            });
            return;
        }
        FriendRequest.findOneAndDelete({
            participants: { $all: [req.user.id, req.params.user_id] },
            accepted: true
        })
            .then(request => {
                if (!request) {
                    res.status(404).json({
                        notFriends: 'You are not friends with this user'
                    });
                    return;
                }
                const friendIndex = request.participants
                    .map(user => user._id.toString())
                    .indexOf(req.params.user_id);
                const friendId = request.participants[friendIndex]._id;
                res.json(friendId);
                return;
            })
            .catch(err => {
                res.status(500).json({ serverError: 'Something went wrong' });
                console.log(err);
            });
    }
);

module.exports = router;
