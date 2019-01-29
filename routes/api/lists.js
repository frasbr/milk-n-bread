const router = require('express').Router();
const mongoose = require('mongoose');
const passport = require('passport');
const keys = require('../../config/keys');

const User = require('../../models/User');
const ShoppingList = require('../../models/ShoppingList');

// TODO:
// Load validation
const isEmpty = require('../../validation/isEmpty');

// TODO:
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

        newList
            .save()
            .then(list => res.json(list))
            .catch(err => {
                console.log(err);
                res.status(500).json({ serverError: 'Something went wrong' });
            });
    }
);

//update/:list

// @route   PATCH /update/:list_id
// @desc    Update items within a shopping list
// @access  Private
router.patch(
    '/update/:list_id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        // Validate form data

        // Sanitise req.params

        ShoppingList.findById(req.params.list_id).then(list => {
            if (!list) {
                res.status(404).json({
                    noList: 'No list found with that id'
                });
                return;
            }

            // Check if user belongs to shopping list provided
            if (
                !list.participants
                    .map(user => user.toString())
                    .contains(req.user.id)
            ) {
                res.status(401).json({
                    Unauthorised:
                        'You do not have permission to edit this shopping list'
                });
                return;
            }

            list.items = req.body.items;
            list.save()
                .then(newList => {
                    res.json(newList);
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

//remove/:list
//get (all)
//get/:list
//:list/add/:user
//:list/remove/:user

module.exports = router;
