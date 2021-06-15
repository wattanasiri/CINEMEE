const   express = require('express'),
        router = express.Router(),
        middlewareObj = require('../middleware/index'),
        User = require('../models/user'),
        Cinema = require('../models/cinema'),
        Movie = require('../models/movie');

let today = new Date(),
    dd = String(today.getDate()).padStart(2, '0').toLocaleString('en-US',{timeZone:'Asia/Bangkok'}),
    mm = String(today.getMonth() + 1).padStart(2, '0'),
    yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;


router.get('/', function(req, res){
    req.session.fromUrl = req.originalUrl;
    Movie.find({date:{$lte:today}}).populate('reviews').sort({date: 1}).exec(function(err, nowMovie){
        if(err){
            console.log(err);
        }else{
            Movie.find({date:{$gt:today}}).populate('reviews').sort({date: 1}).exec(function(err, comingMovie){
                if(err){
                    console.log(err);
                }else{
                    res.render('movies/index.ejs', {nowMovie: nowMovie, comingMovie: comingMovie});
                }
            })
        }
    })
});

router.get('/now', function(req, res){
    req.session.fromUrl = req.originalUrl;
    Movie.find({date:{$lte:today}}).populate('reviews').sort({date: 1}).exec(function(err, nowMovie){
        if(err){
            console.log(err);
        }else{
            res.render('movies/now.ejs', {movie: nowMovie});
        }
    });
});

router.get('/pop', function(req, res){
    req.session.fromUrl = req.originalUrl;
    Movie.find({date:{$lte:today}}).populate('reviews').sort({date: 1}).exec(function(err, foundMovie){
        if(err){
            console.log(err);
        }else{
            res.render('movies/pop.ejs', {movie: foundMovie});
        }
    });
});

router.get('/soon', function(req, res){
    req.session.fromUrl = req.originalUrl;
    Movie.find({date:{$gte:today}}).populate('reviews').sort({date: 1}).exec(function(err, foundMovie){
        if(err){
            console.log(err);
        }else{
            res.render('movies/soon.ejs', {movie: foundMovie});
        }
    });
});

router.get('/:id', function(req, res){
    req.session.fromUrl = req.originalUrl;
    Movie.findById(req.params.id).populate('reviews').exec(function(err, foundMovie){
        if(err){
            console.log(err);
        } else{ 
            Cinema.find({movies: {$elemMatch: {$eq: req.params.id}}}).populate({
                path: "theater",
                populate: {
                    path: "showtime",
                    match: {date: {$gte: today}}
                }
            }).exec(function(err, foundCinema){
                if(err){
                    console.log(err);
                }else{
                    res.render('movies/moviepage.ejs', {movie: foundMovie, cinema: foundCinema});
                }
            })
        }
    });
});

router.post('/:id/addFavorite', middlewareObj.isLoggedIn, function(req, res){
    User.findById(req.user.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            foundUser.favoriteMovie.push(req.body.movie);
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
            const index = foundUser.favoriteMovie.indexOf(req.body.movie);
            foundUser.favoriteMovie.splice(index, 1);
            foundUser.save();
            res.redirect('back');
        }
    });
});

module.exports = router;