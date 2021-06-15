const   express = require('express'),
        router = express.Router(),
        Promotion = require('../models/promotion');

router.get('/', function(req, res){
    req.session.fromUrl = req.originalUrl;
    Promotion.find({}, function(err, allPromotion){
        if(err){
            console.log(err);
        }else{
            res.render('promotions/index.ejs', {promotion: allPromotion});
        }
    });
    
});

module.exports = router;