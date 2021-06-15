const   express = require('express'),
        router = express.Router({mergeParams: true}),
        Movie = require('../../models/movie'),
        Cinema = require('../../models/cinema'),
        Theater = require('../../models/theater'),
        Showtime = require('../../models/showtime'),
        Seat = require('../../models/seat');

let today = new Date(),
    dd = String(today.getDate()).padStart(2, '0').toLocaleString('en-US',{timeZone:'Asia/Bangkok'}),
    mm = String(today.getMonth() + 1).padStart(2, '0'),
    yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

router.post('/', function(req, res){
    Theater.create({theaterNo: "N/A"}, function(err, createTheater){
        if(err){
            console.log(err);
        }else{
            Cinema.findOneAndUpdate({"_id": req.params.id}, {$push: {theater: createTheater}}).exec(function(err, updatedCinema){
                if(err){
                    console.log(err);
                }else{
                    console.log(createTheater);
                    res.redirect('/admin/cinema/' + req.params.id + '/manage')
                }
            });
        }
    });
});

router.put('/:theater_id', function(req, res){
    Theater.findByIdAndUpdate(req.params.theater_id, req.body.theater, function(err, updateTheater){
        if(err){
            console.log(err);
            res.redirect('/admin/cinema/' + req.params.id + '/manage');
        }else{
            res.redirect('/admin/cinema/' + req.params.id + '/manage');
        }
    });
});

router.delete('/:theater_id', function(req, res){
    Theater.findByIdAndRemove(req.params.theater_id, function(err, removeTheater){
        if(err){
            console.log(err);
            res.redirect('/admin/cinema/' + req.params.id + '/manage');
        }else{
            Cinema.findById(req.params.id, function(err, foundCinema){
                if(err){
                    console.log(err);
                }else{
                    const index = foundCinema.theater.indexOf(req.params.theater_id);
                    foundCinema.theater.splice(index, 1);
                    foundCinema.save();
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
                                            console.log(removeSeat);
                                        }
                                    });                        
                                });                                                                      
                            }
                        })
                    })
                }
            });
            res.redirect('/admin/cinema/' + req.params.id + '/manage');
        }
    });
});

router.get('/:theater_id/showtime', function(req, res){
    Cinema.findById(req.params.id).populate('movies').exec(function(err, foundCinema){
        if(err){
            console.log(err);
        }else{
            Theater.findById(req.params.theater_id).populate({
                path: "showtime", 
                options: {sort: {date: 1, time: 1 }}, 
                populate: [
                    {path: "movie"}, 
                    {path:"seat"}
                ]
            }).exec(function(err, foundTheater){
                if(err){
                    console.log(err);
                    res.redirect('/admin/cinema/' + req.params.id + '/manage');
                }else{
                    res.render('admin/cinemas/manage/showtime.ejs', {cinema: foundCinema, theater: foundTheater});
                }
            });
        }
    });    
});

router.post('/:theater_id/showtime', function(req, res){
    Theater.findById(req.params.theater_id, function(err, foundTheater){
        if(err){
            console.log(err);
        }else{
            Showtime.create(req.body.showtime, function(err, createShowtime){
                if(err){
                    console.log(err);
                }else{
                    const alphabetArray = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
                    var i, row, column, seatNo;
                    numOfSeat = [];
                    for(i = 0; i < foundTheater.numberOfRow; i++){
                        row = alphabetArray[i]
                        for(column = 1; column <= foundTheater.numberOfColumn; column++){
                            seatNo = row + column;
                            numOfSeat.push({seatNo: seatNo, seatRow: row, seatColumn: column});
                        }
                    }
                    Seat.insertMany(numOfSeat, function(err, seatCreated){    
                        if(err){
                            console.log(err);
                        }else{
                            Showtime.findOneAndUpdate({"_id": createShowtime._id}, {$push:{seat: seatCreated}}).exec(function(err, updatedShowtime){
                                if(err){
                                    console.log(err);
                                }else{
                                    foundTheater.showtime.push(createShowtime._id);
                                    foundTheater.save();
                                    res.redirect('/admin/cinema/' + req.params.id + '/manage/theater/' + req.params.theater_id + '/showtime');                    
                                }
                            }); 
                        }               
                    });
                }
            });
        }
    });
});

router.put('/:theater_id/showtime/:showtime_id', function(req, res){
    Showtime.findByIdAndUpdate(req.params.showtime_id, req.body.showtime, function(err, updateShowtime){
        if(err){
            console.log(err);
        }else{
            console.log(updateShowtime);
            res.redirect('/admin/cinema/' + req.params.id + '/manage/theater/' + req.params.theater_id + '/showtime')
        }
    })
})

router.delete('/:theater_id/showtime/:showtime_id', function(req, res){
    Showtime.findByIdAndRemove(req.params.showtime_id, function(err, removeShowtime){
        if(err){
            console.log(err);
        }else{
            Theater.findById(req.params.theater_id, function(err, foundTheater){
                if(err){
                    console.log(err);
                }else{
                    const index = foundTheater.showtime.indexOf(req.params.showtime_id);
                    foundTheater.showtime.splice(index, 1);
                    foundTheater.save();
                    removeShowtime.seat.forEach(function(seatId){
                        Seat.findByIdAndRemove(seatId, function(err, removeSeat){
                            if(err){
                                console.log(err);
                            }else{
                                console.log(removeSeat);
                            }
                        });                        
                    });                    
                    res.redirect('/admin/cinema/' + req.params.id + '/manage/theater/' + req.params.theater_id + '/showtime');
                }
            });
        }
    })
})

module.exports = router;