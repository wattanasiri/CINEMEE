const mongoose = require('mongoose');

let transactionSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    branch: String,
    movie: String,
    date: String,
    showtime: String,
    theater: String,
    seat: String,
    total: Number
});

module.exports = mongoose.model('Transaction', transactionSchema);
