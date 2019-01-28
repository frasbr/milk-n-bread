const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = require('Item');

const ShoppingListSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    admins: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'users'
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
