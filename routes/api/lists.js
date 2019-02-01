const router = require('express').Router();
const mongoose = require('mongoose');
const passport = require('passport');
const keys = require('../../config/keys');

const User = require('../../models/User');
const ShoppingList = require('../../models/ShoppingList');

// TODO:
// Load validation
const isEmpty = require('../../validation/isEmpty');

// Routes
// @route   POST /create
// @desc    Create a new ShoppingList
// @access  Private
router.post(
    '/create',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        // Validate form data
        /* const {errors, isValid} = validateListCreate(req.body);
        if (!isValid) {
            res.status(400).json(errors);
        } */

        const newList = new ShoppingList({
            name: req.body.name,
            description: req.body.description,
            author: req.user.id
        });

        newList.contributors.push(req.user.id);

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
        // Validate req.params.list_id

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
                !list.contributors
                    .map(user => user.toString())
                    .contains(req.user.id)
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

// @route   POST /:list_id/removeItem/:item_id
// @desc    Remove an item from a ShoppingList
// @access  Private - Restricted to ShoppingList.contributors
router.post(
    '/:list_id/removeItem/:item_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        // Validate form input
        // Validate req.params

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
                !list.contributors
                    .map(user => user.toString())
                    .contains(req.user.id)
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

// @route   /:list_id/updateItem/:item_id
// @desc    Update the quantity of an item
// @access  Private - Restricted to ShoppingList.contributors
router.patch(
    '/:list_id/updateItem/:item_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        // Validation and sanitisation goes here

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
                !list.contributors
                    .map(user => user.toString())
                    .contains(req.user.id)
            ) {
                res.status(401).json({
                    Unauthorised:
                        'You do not have permission to edit this shopping list'
                });
                return;
            }

            // Find item within list
            const itemIndex = list.items.indexOf(req.params.item_id);
            if (itemIndex < 0) {
                res.status(404).json({
                    noItem: 'No item found with that id in this list'
                });
                return;
            }

            const item = list.items[itemIndex];

            item.quantity = req.body.quantity
                ? req.body.quantity
                : item.quantity;

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
        // VALIDATE AND SANITISE

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

            if (!list.contributors.indexOf(req.params.user_id) < 0) {
                res.status(400).json({
                    noUser: 'User already belongs to this list'
                });
                return;
            }

            list.contributors.push(req.params.user_id);
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

// @route   PATCH /:list_id/removeUser/:user_id
// @desc    Remove a user from a ShoppingList's contributors
// @access  Private - Restricted to ShoppingList.author
router.patch(
    '/:list_id/removeUser/:user_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        // VALIDATE AND SANITISE

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

            if (list.contributors.indexOf(req.params.user_id) < 0) {
                res.status(404).json({
                    noUser: 'No user with that id belongs to this list'
                });
                return;
            }

            list.contributors.pull(req.params.user_id);
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
        ShoppingList.find({ contributors: req.user.id }).then(lists => {
            if (!lists || lists.length < 1) {
                res.status(404).json({
                    noLists: "You don't belong to any shopping lists"
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
    '/',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        // Sanitise req.params.list_id

        ShoppingList.findById(req.params.list_id).then(list => {
            if (!list) {
                res.status(404).json({
                    noList: 'No list found with that id'
                });
                return;
            }

            if (list.contributors.indexOf(req.user.id) < 0) {
                res.status(401).json({
                    unauthorised: 'You are not authorised to view this list'
                });
            }

            res.json(list);
        });
    }
);

//get (all)
//get/:list

module.exports = router;
