const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendRequestSchema = new Schema({
    participants: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'users'
            }
        ],
        required: true,
        validate: [
            arr => arr.length === 2,
            'There must be two and only two participants'
        ]
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    pending: {
        type: Boolean,
        required: true,
        default: true
    },
    accepted: {
        type: Boolean
    },
    date: {
        type: Date,
        default: Date.now()
    },
    acceptedDate: {
        type: Date
    }
});

module.exports = FriendRequest = mongoose.model(
    'friendRequest',
    FriendRequestSchema
);
