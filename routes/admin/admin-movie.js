const   express = require('express'),
        router = express.Router(),
        fs = require('fs'),
        multer = require('multer'),
        path = require('path'),
        storage = multer.diskStorage({
            destination: function(req, file, callback){
                callback(null, './public/uploads/poster/');
            },
            filename: function(req, file, callback){
                callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
            }
        }),
        imageFilter = function(req, file, callback){
            if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)){
                return callback(new Error('Only JPG, JPEG, PNG and GIF image file are allowed!'), false);
            }
            callback(null, true);
        },
        upload = multer({storage: storage, fileFilter: imageFilter}),
        User = require('../../models/user'),
        Cinema = require('../../models/cinema'),
        Movie = require('../../models/movie'),
        Theater = require('../../models/theater'),
        Showtime = require('../../models/showtime'),
        Seat = require('../../models/seat'),
        Review = require('../../models/review');

let today = new Date(),
    dd = String(today.getDate()).padStart(2, '0').toLocaleString('en-US',{timeZone:'Asia/Bangkok'}),
    mm = String(today.getMonth() + 1).padStart(2, '0'),
    yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;


router.get('/', function(req, res){
    Movie.find({}).sort({date: 1}).exec(function(err, foundMovie){
        if(err){
            console.log(err);
        }else{
            res.render('admin/movies/movie.ejs', {movie: foundMovie});
        }
    });
});

router.get('/new', function(req, res){
    res.render('admin/movies/new.ejs');
});

router.post('/new', upload.single('poster'), function(req, res){
    if(req.file){
        req.body.movie.poster = '/uploads/poster/' + req.file.filename;
    }else{
        req.body.movie.poster = '/img/cinema-logo.png'
    }
    Movie.create(req.body.movie, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else{
            console.log(newlyCreated);
            console.log('Add new movie success')
            res.redirect('/admin/movie');
        }
    });
});

router.get('/:id/info', function(req, res){
    Movie.findById(req.params.id).populate('reviews').exec(function(err, foundMovie){
        if(err){
            console.log(err);
        }else{
            res.render('admin/movies/info.ejs', {movie: foundMovie})
        }
    });
});

router.delete('/:id/removeReview/:review_id', function(req, res){
    Review.findByIdAndRemove(req.params.reviews_id, function(err, deleteReview){
        if(err){
            res.redirect('back');
        }else{
            Movie.findOneAndUpdate({"_id": req.params.id}, {$pull: {reviews: req.params.reviews_id}}).exec(function(err, foundMovie){
                if(err){
                    console.log(err);
                }else{
                    var check = false;
                    for(i=1; i <= foundMovie.rating.length; i++){
                        if(check){
                            console.log('skip')                       
                        }else if(deleteReview.rating === foundMovie.rating[i]){
                            foundMovie.rating.splice(i, 1);
                            foundMovie.save();
                            return check = true;
                        }
                    }
                    res.redirect('/movie/' + req.params.id);                   
                }
            });            
        }
    });
});

router.get('/:id/edit', function(req, res){
    Movie.findById(req.params.id, function(err, foundMovie){
        if(err){
            console.log(err);
        }else{
            res.render('admin/movies/edit.ejs', {movie: foundMovie});
        }
    });
});

router.put('/:id', upload.single('poster'), function(req, res){
    if(req.file){
        req.body.movie.poster = '/uploads/poster/' + req.file.filename;
    }
    Movie.findByIdAndUpdate(req.params.id, req.body.movie, function(err, updatedMovie){
        if(err){
            console.log(err);
            res.redirect('/admin/movie/');
        }else{
            res.redirect('/admin/movie/');
        }
    });
});

router.delete('/:id', function(req, res){
    Movie.findByIdAndRemove(req.params.id, function(err, removeMovie){
        if(err){
            console.log(err);
            res.redirect('/admin/movie/');
        }else{
            if(removeMovie.poster === "/img/cinema-logo.png"){
                console.log("Photo is null");
            }else{
                const path = "D:/HTML_Project/Sneemee/public" + removeMovie.poster;
                fs.unlink(path, function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log('Remove poster file');
                    }
                });
            }
            
            User.find({}, function(err, foundUser){
                if(err){
                    console.log(err);
                }else{
                    foundUser.forEach(function(user){
                        user.favoriteMovie.forEach(function(favMov){
                            if(favMov.equals(req.params.id)){
                                const index = user.favoriteMovie.indexOf(req.params.id);
                                user.favoriteMovie.splice(index, 1);
                                user.save();
                                console.log('Remove favorite movie from User: ' + user.username);
                            }
                        });
                    });                    
                }
            });
            Cinema.find({}, function(err, foundCinema){
                if(err){
                    console.log(err);
                }else{
                    foundCinema.forEach(function(cinema){
                        cinema.movies.forEach(function(movie){
                            if(movie.equals(req.params.id)){
                                const index = cinema.movies.indexOf(req.params.id);
                                cinema.movies.splice(index, 1);
                                cinema.save();
                                console.log('Remove movie from Cinema: ' + cinema.branch);
                            }
                        });
                    });                    
                }
            });
            Showtime.find({}, function(err, foundShowtime){
                if(err){
                    console.log(err);
                }else{
                    foundShowtime.forEach(function(showtime){
                        if(showtime.movie.equals(req.params.id)){
                            Showtime.findByIdAndRemove(showtime._id, function(err, removeShowtime){
                                if(err){
                                    console.log(err);
                                }else{
                                    removeShowtime.seat.forEach(function(seatId){
                                        Seat.findByIdAndRemove(seatId, function(err, removeSeat){
                                            if(err){
                                                console.log(err);
                                            }else{
                                                console.log(removeSeat);
                                            }
                                        });                        
                                    });   
                                    Theater.find({}, function(err, foundTheater){
                                        if(err){
                                            console.log(err);
                                        }else{
                                            foundTheater.forEach(function(theater){
                                                theater.showtime.forEach(function(showtimeId){
                                                    if(showtimeId.equals(removeShowtime._id)){
                                                        const index = theater.showtime.indexOf(removeShowtime._id);
                                                        theater.showtime.splice(index, 1);
                                                        theater.save();
                                                    }
                                                });
                                            });
                                        }
                                    });
                                    console.log(removeShowtime);
                                    console.log('Remove Showtime');
                                }
                            });
                        }
                    });
                }
            });
            removeMovie.reviews.forEach(function(reviewId){
                Review.findByIdAndRemove(reviewId, function(err, removeReview){
                    if(err){
                        console.log(err);
                    }else{
                        console.log(removeReview);
                        console.log('Remove all Review in movie')
                    }
                });
            });
            console.log(removeMovie);
            res.redirect('/admin/movie/');
        }
    });
});

module.exports = router;