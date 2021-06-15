const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema({
    branch: String,
    movies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie'
        }
    ],
    theater: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Theater'
        }
    ]
});

module.exports = mongoose.model('Cinema', cinemaSchema);