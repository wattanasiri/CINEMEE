const mongoose = require('mongoose');

let movieSchema = new mongoose.Schema({
    name: String,
    poster: String,
    date: String,
    trailer: String,
    type:[String],
    time: String,
    desc: String,
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        },        
    ],
    rating:[
        {
            type: Number
        }
    ]
});

module.exports = mongoose.model('Movie', movieSchema);
