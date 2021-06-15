const   middlewareObj = {},
        Review = require('../models/review');

middlewareObj.nowLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        res.redirect('back');
    }else{
        next();
    }
};

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
};

middlewareObj.checkReviewOwner = function(req, res, next){
    if(req.isAuthenticated()){
        Review.findById(req.params.reviews_id, function(err, foundReview){
            if(err){
                res.redirect('back');
            }else{
                if(foundReview.author.id.equals(req.user._id)){
                    next();
                }else{
                    res.redirect('back');
                }
            }
        });
    }else{
        res.redirect('back');
    }
};

middlewareObj.isAdmin = function(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.isAdmin === true){
            next();
        }else{
            res.redirect('back');   
        }
    }else{
        res.redirect('/login');
    }
}

middlewareObj.isUser = function(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.isAdmin === false){
            next();
        }else{
            res.redirect('/admin/user');
        }
    }else{
        next();
    }
}

module.exports = middlewareObj;