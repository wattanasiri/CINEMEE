const   mongoose = require('mongoose'),
        passportLocalMongoose = require('passport-local-mongoose');
        
const  UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    firstname: String,
    lastname: String,
    image: {
        type: String,
        default: '/img/profile.png'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    isHeaderAdmin: {
        type: Boolean,
        default: false
    },
    favoriteMovie:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie'
        }
    ],
    favoriteCinema:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cinema'
        }
    ]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
