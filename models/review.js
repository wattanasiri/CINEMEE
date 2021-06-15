const mongoose = require('mongoose');

let reviewSchema = new mongoose.Schema({
    text: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String 
    },
    rating: Number
});

module.exports = mongoose.model('Review', reviewSchema);
