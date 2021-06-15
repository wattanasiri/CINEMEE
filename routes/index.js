const { nextTick } = require('process');

const   express = require('express'),
        router = express.Router(),
        fs = require('fs'),
        multer = require('multer'),
        path = require('path'),
        storage = multer.diskStorage({
            destination: function(req, file, callback){
                callback(null, './public/uploads/profile-pic/');
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
        User = require('../models/user'),
        passport = require('passport'),
        Promotion = require('../models/promotion'),
        Cinema = require('../models/cinema'),
        Movie = require('../models/movie'),
        Transaction = require('../models/transaction'),
        middlewareObj = require('../middleware/index');

let today = new Date(),
    dd = String(today.getDate()).padStart(2, '0').toLocaleString('en-US',{timeZone:'Asia/Bangkok'}),
    mm = String(today.getMonth() + 1).padStart(2, '0'),
    yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

router.get('/', middlewareObj.isUser, function(req, res){
    req.session.fromUrl = '/';
    Movie.find({date:{$lte:today}}).populate("reviews").sort({date: 1}).exec(function(err, foundMovie){
        if(err){
            console.log(err);
        }else{
            Promotion.find({}, function(err, allPromotion){
                if(err){
                    console.log(err);
                }else{
                    popularMovie = []
                    foundMovie.forEach(function(movie){
                        if(movie.rating == ''){                            
                        }else{
                            var rate = 0
                            movie.rating.forEach(function(rating){
                                rate = rate+rating;
                            });
                            rate = rate/movie.rating.length
                            popularMovie.push({movie: movie._id, rating: rate})
                        }
                    });
                    popularMovie.sort(function (a, b) {
                        return b.rating - a.rating;
                      });
                    if(popularMovie.length > 6){
                        var remove = popularMovie.length - 6;
                        popularMovie.splice(6, remove);
                    }
                    findPopular = [];
                    for(i = 0; i < popularMovie.length; i++){
                        findPopular.push(popularMovie[i].movie)
                    }                    
                    Movie.find({_id: findPopular}, function(err, foundPopular){
                        if(err){
                            console.log(err);
                        }else{
                            res.render('home.ejs', {movie: foundMovie, popMovie: foundPopular, promotion: allPromotion});
                        }
                    });                   
                }
            });
        }    
    });
});

router.get('/search', function(req, res){
    req.session.fromUrl = req.originalUrl;
    const word = '';
    Movie.find({$or:[{name: {$regex: word, $options:'i'}}, {type: {$regex: word, $options:'i'}}]}).populate("reviews").sort({date: 1}).exec(function(err, foundMovie){
        if(err){
            console.log(err);
        } else {
            Cinema.find({branch: {$regex: word, $options: 'i'}}, function(err, foundCinema){
                if(err){
                    console.log(err);
                }else{
                    res.render('search.ejs', {movie: foundMovie, cinema: foundCinema,  word: word});
                }
            });            
        }
    });
})

router.post('/search', function(req, res){
    req.session.fromUrl = req.originalUrl;
    const word = req.body.search;
    Movie.find({$or:[{name: {$regex: word, $options:'i'}}, {type: {$regex: word, $options:'i'}}]}).populate("reviews").sort({date: 1}).exec(function(err, foundMovie){
        if(err){
            console.log(err);
        } else {
            Cinema.find({branch: {$regex: word, $options: 'i'}}, function(err, foundCinema){
                if(err){
                    console.log(err);
                }else{
                    res.render('search.ejs', {movie: foundMovie, cinema: foundCinema,  word: word});
                }
            });            
        }
    });
})

router.get('/login', middlewareObj.nowLoggedIn, function(req, res){
    res.render('login.ejs');
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

router.post('/register', function(req, res){
    const   username = req.body.username,
            email = req.body.email,
            firstname = req.body.firstname,
            lastname = req.body.lastname;
    const   newUser = new User({username: username, email: email, firstname: firstname, lastname: lastname});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.redirect('/login');
        }
        passport.authenticate('local')(req, res, function(){
            res.redirect(req.session.fromUrl);
        });
    });
});

router.post('/login', passport.authenticate('local',
    {   
        failureRedirect: '/login'
    }), function(req, res){        
            if(req.user.isAdmin === true){
                res.redirect('/admin/user');
            }else{
                res.redirect(req.session.fromUrl);
            }
});

router.get('/profile/:id', middlewareObj.isUser, function(req, res){
    User.findById(req.params.id).populate([{
        path: "favoriteMovie",
        options: {sort: {date: 1,}},
        populate: {path: "reviews"}
    }, 
    {path: "favoriteCinema"}
    ]).exec(function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            Transaction.find({customer: {$eq: req.params.id}}).exec(function(err, foundTransaction){
                if(err){
                    console.log(err);
                }else{
                    res.render('user/profile.ejs', {user: foundUser, transaction: foundTransaction});
                }
            });          
        }
    });    
});

router.get('/profile/:id/edit', middlewareObj.isUser, function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            res.render('user/edit.ejs', {user: foundUser});
        }
    });
});

router.put('/profile/:id/edit', upload.single('image'), middlewareObj.isUser, function(req, res){
    if(req.file){
        req.body.user.image = '/uploads/profile-pic/' + req.file.filename;
    }
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            res.redirect('/profile/' + req.params.id);
        }
    });
});

router.delete('/profile/:id/delete', middlewareObj.isUser, function(req, res){
    User.findByIdAndRemove(req.params.id, function(err, removeUser){
        if(err){
            console.log(err);
            res.redirect('/profile');
        }else{
            if(removeUser.image === "/img/profile.png"){
                console.log("Photo is null");
            }else{
                const path = "D:/HTML_Project/Sneemee/public" + removeUser.image;                
                fs.unlink(path, function(err){
                    if(err){
                        console.log(err);
                    }else{
                        console.log('Remove profile-pic');
                    }
                });
            }
            res.redirect('/logout');
        }
    });
});

module.exports = router;