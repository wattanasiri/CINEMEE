const   express = require('express'),
        app = express(),
        mongoose = require('mongoose'),
        bodyParser = require('body-parser'),
        passport = require('passport'),
        localStrategy = require('passport-local'),        
        methodOverride = require('method-override'),
        flash = require('connect-flash'),
        seedDB = require('./seed'),
        User = require('./models/user'),
        middlewareObj = require('./middleware/index');

const   indexRoutes = require('./routes/index'),
        movieRoutes = require('./routes/movie'),
        reviewsRoutes = require('./routes/review'),
        cinemaRoutes = require('./routes/cinema'),
        promotionRoutes = require('./routes/promotion'),
        showtimeRoutes = require('./routes/showtime');

const   adminUserRoutes = require('./routes/admin/admin-user'),
        adminMovieRoutes = require('./routes/admin/admin-movie'),
        adminCinemaRoutes = require('./routes/admin/admin-cinema'),
        adminPromotionRoutes = require('./routes/admin/admin-promotion'),
        adminTheaterRoutes = require('./routes/admin/admin-theater');

mongoose.connect('mongodb://localhost/Sneemee');
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
// seedDB();

app.use(require('express-session')({
    secret: 'secret is always secret.',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

app.use('/', indexRoutes);
app.use('/movie', middlewareObj.isUser, movieRoutes);
app.use('/movie/:id/review', middlewareObj.isUser, reviewsRoutes);
app.use('/cinema', middlewareObj.isUser, cinemaRoutes);
app.use('/promotion', middlewareObj.isUser, promotionRoutes);
app.use('/cinema/:id/showtime', middlewareObj.isUser, showtimeRoutes);

app.use('/admin/user', middlewareObj.isAdmin, adminUserRoutes);
app.use('/admin/movie', middlewareObj.isAdmin, adminMovieRoutes);
app.use('/admin/cinema', middlewareObj.isAdmin, adminCinemaRoutes);
app.use('/admin/promotion', middlewareObj.isAdmin, adminPromotionRoutes);
app.use('/admin/cinema/:id/manage/theater', middlewareObj.isAdmin, adminTheaterRoutes)

app.listen(3000, function(){
    console.log('CINEMEE server is running..');
});