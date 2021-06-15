const   express = require('express'),
        router = express.Router(),
        multer = require('multer'),
        path = require('path'),
        storage = multer.diskStorage({
            destination: function(req, file, callback){
                callback(null, './public/uploads/promotion');
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
        Promotion = require('../../models/promotion');

let today = new Date(),
    dd = String(today.getDate()).padStart(2, '0').toLocaleString('en-US',{timeZone:'Asia/Bangkok'}),
    mm = String(today.getMonth() + 1).padStart(2, '0'),
    yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;

router.get('/', function(req, res){
    Promotion.find({}, function(err, foundPromotion){
        if(err){
            console.log(err);
        }else{
            res.render('admin/promotions/promotion.ejs', {promotion: foundPromotion});
        }
    });
});

router.get('/new', function(req, res){
    Promotion.find({}, function(err, foundPromotion){
        if(err){
            console.log(err);
        }else{
            res.render('admin/promotions/new.ejs', {promotion: foundPromotion});
        }
    });
});

router.post('/new', upload.single('image'), function(req, res){
    req.body.promotion.image = '/uploads/promotion/' + req.file.filename;
    Promotion.create(req.body.promotion, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else{
            console.log(newlyCreated);
            console.log('Add new movie success')
            res.redirect('/admin/promotion');
        }
    });
});

router.delete('/:id', function(req, res){
    Promotion.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            res.redirect('/admin/promotion/');
        }else{
            res.redirect('/admin/promotion/');
        }
    });
});

router.get('/:id/edit', function(req, res){
    Promotion.findById(req.params.id, function(err, foundPromotion){
        if(err){
            console.log(err);
        }else{
            res.render('admin/promotions/edit.ejs', {promotion: foundPromotion});
        }
    });
});

router.put('/:id', upload.single('image'), function(req, res){
    if(req.file){
        req.body.promotion.image = '/uploads/promotion/' + req.file.filename;
    }
    Promotion.findByIdAndUpdate(req.params.id, req.body.promotion, function(err, updatedPromotion){
        if(err){
            console.log(err);
            res.redirect('/admin/promotion/');
        }else{
            res.redirect('/admin/promotion/');
        }
    });
});

module.exports = router;