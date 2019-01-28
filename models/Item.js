const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    purchased: {
        type: Boolean,
        required: true
    },
    purchasedBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    }
});

module.exports = Item = mongoose.model('items', ItemSchema);
