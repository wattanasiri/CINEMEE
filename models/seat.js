const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    seatNo: String,
    seatRow: String,
    seatColumn: String,
    available: {
        type: Boolean,
        default: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Seat', seatSchema);