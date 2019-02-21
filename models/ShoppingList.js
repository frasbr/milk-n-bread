const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = require('./Item');

const ShoppingListSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    contributors: {
        type: [
            {
                id: {
                    type: Schema.Types.ObjectId,
                    ref: 'users'
                },
                username: String
            }
        ]
    },
    items: {
        type: [itemSchema]
    },
    published: {
        type: Date,
        default: Date.now()
    }
});

module.exports = ShoppingList = mongoose.model(
    'shoppingLists',
    ShoppingListSchema
);
