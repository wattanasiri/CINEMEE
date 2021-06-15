const   mongoose = require('mongoose'),
        Movie = require('./models/movie'),
        Review = require('./models/review');

function seedDB(){
    Review.remove({}, function(err){
        if(err){
            console.log(err);
        }else{
            console.log('Remove reviewSchema complete');
        }
    });
    Movie.remove({}, function(err){
        if(err){
            console.log(err);
        }else{
            console.log('Remove movieSchema complete');
        }
    })
    User.remove({}, function(err){
        if(err){
            console.log(err);
        }else{
            console.log('Remove userSchema complete');
        }
    })
}

module.exports = seedDB;