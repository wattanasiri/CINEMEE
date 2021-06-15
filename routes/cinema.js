const   express = require('express'),
        router = express.Router(),
        Cinema = require('../models/cinema'),
        User = require('../models/user'),
        Movie = require('../models/movie'),
        Theater = require('../models/theater'),
        Showtime = require('../models/showtime'),
        middlewareObj = require('../middleware/index');

let today = new Date(),
    dd = String(today.getDate()).padStart(2, '0').toLocaleString('en-US',{timeZone:'Asia/Bangkok'}),
    mm = String(today.getMonth() + 1).padStart(2, '0'),
    yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

router.get('/', function(req, res){
    req.session.fromUrl = req.originalUrl;
    Cinema.find({}, function(err, allCinema){
        if(err){
            console.log(err);
        }else{
            res.render('cinemas/index.ejs', {cinema: allCinema});
        }
    });
});

router.get('/:id', function(req, res){
    req.session.fromUrl = req.originalUrl;
    Cinema.findById(req.params.id).populate([{
        path: "theater", 
        option: {sort: {theaterNo: 1}}, 
        populate: {
            path: "showtime", 
            options: {sort: {date: 1, time: 1 }},
            match: {date: {$eq: today}}, 
            populate: [
                {path: "movie"}, 
                {path:"seat"}
            ]
        }
    },{path: "movies", populate: {path: "reviews"}}
    ]).exec(function(err, foundCinema){
        if(err){
            console.log(err);
        } else{
            res.render('cinemas/cinemapage.ejs', {cinema: foundCinema}); 
        }
    });
});

router.post('/:id/addFavorite', middlewareObj.isLoggedIn, function(req, res){
    User.findById(req.user.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            foundUser.favoriteCinema.push(req.body.cinema);
            foundUser.save();
            res.redirect('back');
        }
    });
});

router.post('/:id/removeFavorite', function(req, res){
    User.findById(req.user.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            const index = foundUser.favoriteCinema.indexOf(req.body.cinema);
            foundUser.favoriteCinema.splice(index, 1);
            foundUser.save();
            res.redirect('back');
        }
    })
})

module.exports = router;