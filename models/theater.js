const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    theaterNo: String,
    showtime: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Showtime'
        }
    ],
    numberOfRow:{
        type: Number,
        default: 0
    },
    numberOfColumn: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Theater', theaterSchema);