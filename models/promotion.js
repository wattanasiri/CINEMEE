const mongoose = require('mongoose');

let promotionSchema = new mongoose.Schema({
    image: String,
    title: String, 
    desc: String
});

module.exports = mongoose.model('Promotion', promotionSchema);