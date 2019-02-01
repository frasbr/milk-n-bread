const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    purchased: {
        type: Boolean,
        required: true,
        default: false
    },
    purchasedBy: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'users'
            }
        ]
    }
});

module.exports = ItemSchema;
