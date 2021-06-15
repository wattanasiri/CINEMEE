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
        Transaction = require('../../models/transaction'),
        User = require('../../models/user');

router.get('/', function(req, res){
    User.find({}, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            res.render('admin/user/user.ejs', {user: foundUser});
        }
    });
});

router.get('/edit/:id', function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            res.render('admin/user/edit.ejs', {user: foundUser});
        }
    });
});

router.put('/edit/:id', upload.single('image'), function(req, res){
    if(req.file){
        req.body.user.image = '/uploads/profile-pic/' + req.file.filename;
    }
    User.findByIdAndUpdate(req.params.id, req.body.user, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            res.redirect('/admin/user/');
        }
    });
});

router.post('/addAdmin/:id', function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            foundUser.isAdmin = true;
            foundUser.save();
            res.redirect('/admin/user');
        }
    });
});

router.post('/deleteAdmin/:id', function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            console.log(err);
        }else{            
            foundUser.isAdmin = false;
            foundUser.save();            
            res.redirect('/admin/user');
            
        }
    });
});

router.delete('/deleteAccount/:id', function(req, res){
    User.findByIdAndRemove(req.params.id, function(err, removeUser){
        if(err){
            console.log(err);
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
                Transaction.deleteMany({customer: foundUser}, function(err, removeTransaction){
                    if(err){
                        console.log(err);
                    }else{
                        console.log(removeTransaction)
                    }
                })
            }
            res.redirect('/admin/user');
        }
    });
});

module.exports = router;
