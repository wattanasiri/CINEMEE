const   express = require('express'),
        router = express.Router({mergeParams: true}),
        middlewareObj = require('../middleware/index'),
        Showtime = require('../models/showtime'),
        Theater = require('../models/theater'),
        Cinema = require('../models/cinema'),
        Seat = require('../models/seat'),
        Transaction = require('../models/transaction');


router.get('/:showtime_id', function(req, res){
    req.session.fromUrl = req.originalUrl;
    Showtime.findById(req.params.showtime_id).populate([{path: 'movie'}, {path: 'seat'}]).exec(function(err, foundShowtime){
        if(err){
            console.log(err);
        }else{
            Theater.findOne({showtime: {$elemMatch: {$eq: foundShowtime._id}}}).exec(function(err, foundTheater){
                if(err){
                    console.log(err);
                }else{
                    res.render('cinemas/showtime.ejs', {cinema_id: req.params.id, showtime: foundShowtime, theater: foundTheater});
                }
            
            });
        }
    });
});

router.post('/:showtime_id/transaction', middlewareObj.isLoggedIn, function(req, res){
    const   seatNo = req.body.seatNo,
            count = seatNo.length,
            total = 120*count,
            subTotal = total*0.93,
            vat = total*0.07;
    Showtime.findById(req.params.showtime_id).populate([{path: 'movie'}, {path: 'seat'}]).exec(function(err, foundShowtime){
        if(err){
            console.log(err);
        }else{
            Theater.findOne({showtime: {$elemMatch: {$eq: foundShowtime._id}}}).exec(function(err, foundTheater){
                if(err){
                    console.log(err);
                }else{
                    Cinema.findById(req.params.id, function(err, foundCinema){
                        if(err){
                            console.log(err);
                        }else{
                            res.render('cinemas/transaction.ejs', {
                                cinema: foundCinema,
                                showtime: foundShowtime,
                                seatNo: seatNo, 
                                count: count, 
                                total: total,
                                subTotal: subTotal,
                                vat: vat,
                                theater: foundTheater
                            });
                        }
                    });
                }
            });
        }
    });
})

router.post('/:showtime_id/checkout', middlewareObj.isLoggedIn, function(req, res){
    Showtime.findById(req.params.showtime_id, function(err, foundShowtime){
        if(err){
            console.log(err);
        }else{
            Seat.find({$and:[{_id: foundShowtime.seat}, {seatNo: req.body.seatNo}]}).exec(function(err, foundSeat){
                if(err){
                    console.log(err);
                }else{
                    foundSeat.forEach(function(seat){
                        seat.customer = req.user._id;
                        seat.available = false;
                        seat.save();
                    });                    
                }
            });
        }
    });    
    Transaction.create(req.body.transaction, function(err, createTransaction){
        if(err){
            console.log(err);
        }else{
            res.redirect('/cinema/' + req.params.id);
        }
    })
});



module.exports = router;