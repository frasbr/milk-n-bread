const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        type: [
            {
                item: Schema.Types.ObjectId,
                ref: 'items'
            }
        ]
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
