const router = require('express').Router();
const mongoose = require('mongoose');
const passport = require('passport');
const keys = require('../../config/keys');

const User = require('../../models/User');
const ShoppingList = require('../../models/ShoppingList');

// Load validation
const validateListCreate = require('../../validation/listCreate');
const validateItemAdd = require('../../validation/itemAdd');
const validateItemUpdate = require('../../validation/itemUpdate');

// Routes
// @route   POST /create
// @desc    Create a new ShoppingList
// @access  Private
router.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        // Validate form data
        const { errors, isValid } = validateListCreate(req.body);
        if (!isValid) {
            res.status(400).json(errors);
        }

        const newList = new ShoppingList({
            name: req.body.name,
            description: req.body.description,
            author: req.user.id
        });

        const contributor = {
            id: req.user.id,
            username: req.user.username
        };
        newList.contributors.push(contributor);

        newList
            .save()
            .then(list => res.json(list))
            .catch(err => {
                console.log(err);
                res.status(500).json({ serverError: 'Something went wrong' });
            });
    }
);

// @route   POST /:list_id/addItem
// @desc    Add a new item to a ShoppingList
// @access  Private - Restricted to ShoppingList.contributors
router.post(
    '/:list_id/addItem',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        // Validate form input
        const { errors, isValid } = validateItemAdd(req.body);
        if (!isValid) {
            res.status(400).json(errors);
            return;
        }

        ShoppingList.findById(req.params.list_id).then(list => {
            // Check if query returned an instance
            if (!list) {
                res.status(404).json({
                    noList: 'No list found with that id'
                });
                return;
            }

            // Check if user belongs to shopping list provided
            if (
                list.contributors
                    .map(contributor => contributor.id.toString())
                    .indexOf(req.user.id) < 0
            ) {
                res.status(401).json({
                    Unauthorised:
                        'You do not have permission to edit this shopping list'
                });
                return;
            }

            const newItem = {
                name: req.body.name
            };

            if (req.body.quantity) {
                newItem.quantity = req.body.quantity;
            }

            list.items.unshift(newItem);

            list.save()
                .then(list => res.json(list))
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        serverError: 'Something went wrong'
                    });
                });
        });
    }
);

// @route   PATCH /:list_id/removeItem/:item_id
// @desc    Remove an item from a ShoppingList
// @access  Private - Restricted to ShoppingList.contributors
router.patch(
    '/:list_id/removeItem/:item_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        ShoppingList.findById(req.params.list_id).then(list => {
            // Check if query returned an instance
            if (!list) {
                res.status(404).json({
                    noList: 'No list found with that id'
                });
                return;
            }

            // Check if user belongs to shopping list provided
            if (
                list.contributors
                    .map(contributor => contributor.id.toString())
                    .indexOf(req.user.id) < 0
            ) {
                res.status(401).json({
                    Unauthorised:
                        'You do not have permission to edit this shopping list'
                });
                return;
            }

            list.items.pull(req.params.item_id);

            list.save()
                .then(list => res.json(list))
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        serverError: 'Something went wrong'
                    });
                });
        });
    }
);

// @route   /:list_id/purchase/:item_id
// @desc    Set an items status to purchased
// @access  Private - restricted to ShoppingList.contributors
router.patch(
    '/:list_id/purchase/:item_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        ShoppingList.findById(req.params.list_id).then(list => {
            if (!list) {
                res.status(404).json({
                    noList: 'No list found with that id'
                });
                return;
            }

            if (
                list.contributors
                    .map(contributor => contributor.id.toString())
                    .indexOf(req.user.id) < 0
            ) {
                res.status(401).json({
                    unauthorised: 'You do not have permission to edit this list'
                });
                return;
            }

            const itemIndex = list.items
                .map(item => item._id.toString())
                .indexOf(req.params.item_id);
            if (itemIndex < 0) {
                res.status(404).json({
                    noItem: 'No item found in this list with that id'
                });
                return;
            }

            list.items[itemIndex].purchased = true;
            list.items[itemIndex].purchasedBy = req.user.id;
            list.save()
                .then(list => res.json(list))
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        serverError: 'Something went wrong'
                    });
                });
        });
    }
);

// @route   /:list_id/updateItem/:item_id
// @desc    Update the quantity of an item
// @access  Private - Restricted to ShoppingList.contributors
router.patch(
    '/:list_id/updateItem/:item_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        // Validate inputs
        const { errors, isValid } = validateItemUpdate(req.body);
        if (!isValid) {
            res.status(400).json(errors);
            return;
        }

        ShoppingList.findById(req.params.list_id).then(list => {
            // Check if query returned an instance
            if (!list) {
                res.status(404).json({
                    noList: 'No list found with that id'
                });
                return;
            }

            // Check if user belongs to shopping list provided
            if (
                list.contributors
                    .map(contributor => contributor.id.toString())
                    .indexOf(req.user.id) < 0
            ) {
                res.status(401).json({
                    Unauthorised:
                        'You do not have permission to edit this shopping list'
                });
                return;
            }

            // Find item within list
            const itemIndex = list.items
                .map(item => item._id.toString())
                .indexOf(req.params.item_id);
            if (itemIndex < 0) {
                res.status(404).json({
                    noItem: 'No item found with that id in this list'
                });
                return;
            }

            const item = list.items[itemIndex];

            item.quantity = req.body.quantity;

            list.save()
                .then(list => res.json(list))
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        serverError: 'Something went wrong'
                    });
                });
        });
    }
);

// @route   DELETE /remove/:list_id
// @desc    Delete a shopping list
// @access  Private - Restricted to list.author
router.delete(
    '/remove/:list_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        ShoppingList.findById(req.params.list_id).then(list => {
            if (!list) {
                res.status(404).json({
                    noList: 'No list found with that Id'
                });
                return;
            }

            if (list.author.toString() !== req.user.id) {
                res.status(401).json({
                    unauthorised:
                        'You do not have permission to delete this list'
                });
            } else {
                list.remove()
                    .then(list => res.json(list.id))
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            serverError: 'Something went wrong'
                        });
                    });
            }
        });
    }
);

// @route   PATCH /:list_id/addUser/:user_id
// @desc    Add a user to a ShoppingList's contributors
// @access  Private - Restricted to ShoppingList.author

router.patch(
    '/:list_id/addUser/:user_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        ShoppingList.findById(req.params.list_id).then(list => {
            if (!list) {
                res.status(404).json({
                    noList: 'No list found with that Id'
                });
                return;
            }

            if (list.author.toString() !== req.user.id) {
                res.status(401).json({
                    unauthorised: 'You do not have permission to add a user'
                });
                return;
            }

            if (
                !list.contributors
                    .map(contributor => contributor.id.toString())
                    .indexOf(req.params.user_id) < 0
            ) {
                res.status(400).json({
                    noUser: 'User already belongs to this list'
                });
                return;
            }

            User.findById(req.params.user_id)
                .then(user => {
                    if (!user) {
                        res.status(404).json({
                            noUser: 'No user found with that id'
                        });
                        return;
                    }

                    const userToAdd = {
                        id: user._id,
                        username: user.username
                    };

                    list.contributors.push(userToAdd);
                    list.save()
                        .then(list => res.json(list))
                        .catch(err => {
                            console.log(err);
                            res.status(500).json({
                                serverError: 'Something went wrong'
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
    }
);

// @route   PATCH /:list_id/removeUser/:user_id
// @desc    Remove a user from a ShoppingList's contributors
// @access  Private - Restricted to ShoppingList.author
router.patch(
    '/:list_id/removeUser/:user_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        ShoppingList.findById(req.params.list_id).then(list => {
            if (!list) {
                res.status(404).json({
                    noList: 'No list found with that Id'
                });
                return;
            }

            if (list.author.toString() !== req.user.id) {
                res.status(401).json({
                    unauthorised: 'You do not have permission to remove a user'
                });
                return;
            }

            if (
                list.contributors
                    .map(contributor => contributor.id.toString())
                    .indexOf(req.params.user_id) < 0
            ) {
                res.status(404).json({
                    noUser: 'No user with that id belongs to this list'
                });
                return;
            }

            list.contributors.pull();
            list.save()
                .then(list => res.json(list))
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        serverError: 'Something went wrong'
                    });
                });
        });
    }
);

// @route   GET /
// @desc    Retrieve all lists that user belongs to
// @access  Private
router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        ShoppingList.find({ 'contributors.id': req.user.id }).then(lists => {
            if (!lists || lists.length < 1) {
                res.status(404).json({
                    noLists: "You don't have any shopping lists"
                });
                return;
            }

            res.json(lists);
        });
    }
);

// @route   GET /:list_id
// @desc    Retrieve a list specified by a list_id
// @access  Private - Restricted to ShoppingList.contributor
router.get(
    '/:list_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        ShoppingList.findById(req.params.list_id)
            .then(list => {
                if (!list) {
                    res.status(404).json({
                        noList: 'No list found with that id'
                    });
                    return;
                }

                if (
                    list.contributors
                        .map(contributor => contributor.id.toString())
                        .indexOf(req.user.id) < 0
                ) {
                    res.status(401).json({
                        unauthorised: 'You are not authorised to view this list'
                    });
                    return;
                }

                res.json(list);
            })
            .catch(err =>
                res.status(500).json({
                    serverError: 'Something went wrong'
                })
            );
    }
);

module.exports = router;
