const   express = require('express'),
        router = express.Router({mergeParams: true}),
        middleware = require('../middleware/index'),
        Movie = require('../models/movie'),
        Review = require('../models/review');

router.post('/', middleware.isLoggedIn, function(req, res){
    Movie.findById(req.params.id, function(err, foundMovie){
        if(err){
            console.log(err);
            res.redirect('/movie');
        }else{
            Review.create(req.body.review, function(err, review){
                if(err){
                    console.log(err);
                }else{
                    if(req.body.review.rating == null){
                        review.author.id = req.user._id;
                        review.author.username = req.user.username;
                        review.save();
                        foundMovie.reviews.push(review);
                        foundMovie.save();
                        res.redirect('/movie/'+ foundMovie._id);
                    }else{
                        review.author.id = req.user._id;
                        review.author.username = req.user.username;
                        review.save();
                        foundMovie.reviews.push(review);
                        foundMovie.rating.push(req.body.review.rating);
                        foundMovie.save();
                        res.redirect('/movie/'+ foundMovie._id);
                    }
                }
            });
        }
    });
});

router.put('/:reviews_id', middleware.checkReviewOwner, function(req, res){
    Movie.findById(req.params.id, function(err, foundMovie){
        if(err){
            console.log(err);
            res.redirect('/movie');
        }else{   
            Review.findByIdAndUpdate(req.params.reviews_id, req.body.review, function(err, review){
                if(err){
                    console.log(err);
                }else{
                    if(req.body.review.rating == null){
                    }else if(foundMovie.rating.length == 0){
                        foundMovie.rating.push(req.body.review.rating)
                        foundMovie.save();
                    }else{
                        var check = false;
                        for(i=0; i < foundMovie.rating.length; i++){
                            if(check){                      
                            }else if(review.rating === foundMovie.rating[i]){
                                foundMovie.rating.splice(i, 1)
                                foundMovie.rating.push(req.body.review.rating)
                                foundMovie.save();
                                check = true
                            } 
                        }
                        if(!check){
                            foundMovie.rating.push(req.body.review.rating)
                            foundMovie.save();
                        }
                    }
                    res.redirect('/movie/'+ foundMovie._id); 
                }
            });            
        }
    });
});

router.delete('/:reviews_id', middleware.checkReviewOwner, function(req, res){
    Review.findByIdAndRemove(req.params.reviews_id, function(err, deleteReview){
        if(err){
            res.redirect('back');
        }else{
            Movie.findOneAndUpdate({"_id": req.params.id}, {$pull: {reviews: req.params.reviews_id}}).exec(function(err, foundMovie){
                if(err){
                    console.log(err);
                }else{
                    var check = false;
                    for(i=0; i < foundMovie.rating.length; i++){
                        if(check){                      
                        }else if(deleteReview.rating === foundMovie.rating[i]){
                            foundMovie.rating.splice(i, 1)
                            foundMovie.save();
                            check = true
                        }
                    }
                    res.redirect('/movie/' + req.params.id);                   
                }
            });            
        }
    });
});

module.exports = router;