const   express = require('express'),
        router = express.Router(),
        Movie = require('../../models/movie'),
        Cinema = require('../../models/cinema'),
        Showtime = require('../../models/showtime'),
        Seat = require('../../models/seat'),
        Theater = require('../../models/theater');

let today = new Date(),
    dd = String(today.getDate()).padStart(2, '0').toLocaleString('en-US',{timeZone:'Asia/Bangkok'}),
    mm = String(today.getMonth() + 1).padStart(2, '0'),
    yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

router.get('/', function(req, res){
    Cinema.find({}, function(err, foundCinema){
        if(err){
            console.log(err);
        }else{
            res.render('admin/cinemas/cinema.ejs', {cinema: foundCinema});
        }
    });
});

router.delete('/:id', function(req, res){
    Cinema.findByIdAndRemove(req.params.id, function(err,removeCinema){
        if(err){
            console.log(err);
            res.redirect('/admin/cinema');
        } else {
            removeCinema.theater.forEach(function(theaterId){
                Theater.findByIdAndRemove(theaterId, function(err,removeTheater){
                    if(err){
                        console.log(err);
                    } else {
                        removeTheater.showtime.forEach(function(showtimeId){
                            Showtime.findByIdAndRemove(showtimeId, function(err, removeShowtime){
                                if(err){
                                    console.log(err);
                                }else{                        
                                    removeShowtime.seat.forEach(function(seatId){
                                        Seat.findByIdAndRemove(seatId, function(err, removeSeat){
                                            if(err){
                                                console.log(err);
                                            }else{
                                                console.log(removeCinema);                                                
                                            }
                                        });                        
                                    });                                                                      
                                }
                            });
                        });
                    }
                });
            });
            res.redirect('/admin/cinema');
        };
    });
});

router.get('/new', function(req, res){
    Movie.find({date:{$lte:today}}).sort({date: 1}).exec(function(err, allMovie){
        if(err){
            console.log(err);
        }else{
            res.render('admin/cinemas/new.ejs', {movie: allMovie});
        }
    });
});

router.post('/new', function(req, res){
    Cinema.create(req.body.cinema, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            numberOfTheater = [];
            for(i = 1; i <= req.body.numOfTheater; i++){
                numberOfTheater.push({ theaterNo: i});
            }
            Theater.insertMany(numberOfTheater, function(err, theaterCreated){    
                if(err){
                    console.log(err);
                }else{
                    Cinema.findOneAndUpdate({"_id": newlyCreated._id}, {$push:{theater: theaterCreated}}).exec(function(err, updatedCinema){
                        if(err){
                            console.log(err);
                        }else{
                            res.redirect('/admin/cinema');
                        }
                    }); 
                }               
            });
        }
    });
});

router.get('/:id/manageMovie', function(req, res){
    Cinema.findById(req.params.id).populate('movies').exec(function(err, foundCinema){
        if(err){
            console.log(err);
        } else {
            Movie.find({_id:{$nin: foundCinema.movies}, date:{$lte:today}}).sort({date: 1}).exec(function(err, foundAdddMovie){
                if(err){
                    console.log(err);
                } else {
                    Movie.find({_id:{$in: foundCinema.movies}, date:{$lte:today}}).sort({date: 1}).exec(function(err, foundRemoveMovie){
                        if(err){
                            console.log(err);
                        } else {
                            res.render('admin/cinemas/manageMovie.ejs', {cinema: foundCinema, movieAdd: foundAdddMovie, movieRemove: foundRemoveMovie});
                        }
                    });
                }
            });
        }
    });
});

router.post('/:id/addmovie/:movie_id', function(req, res){
    Cinema.findOneAndUpdate({"_id": req.params.id}, {$push:{movies: req.params.movie_id}}).exec(function(err, updatedCinema){
        if(err){
            console.log(err);
        }else{
            res.redirect('/admin/cinema/' + req.params.id + '/manageMovie');
        }
    });
});

router.post('/:id/removemovie/:movie_id', function(req, res){
    Cinema.findOneAndUpdate({"_id": req.params.id}, {$pull:{movies: req.params.movie_id}}).exec(function(err, updatedCinema){
        if(err){
            console.log(err);
        }else{
            res.redirect('/admin/cinema/' + req.params.id + '/manageMovie');
        }
    });
});

router.put('/:id', function(req, res){
    Cinema.findByIdAndUpdate(req.params.id, req.body.cinema, function(err, updatedCinema){
        if(err){
            console.log(err);
            res.redirect('/admin/cinema/');
        }else{
            console.log(updatedCinema)
            res.redirect('/admin/cinema/');
        }
    });
});

router.get('/:id/manage', function(req, res){
    Cinema.findById(req.params.id).populate({path: 'theater', options: {sort: {theaterNo: 1}}}).exec(function(err, foundCinema){
        if(err){
            console.log(err);
        }else{
            res.render('admin/cinemas/manage/index.ejs', {cinema: foundCinema});
        }
    });
});

module.exports = router;