const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const catchAsyncErr = require('./utils/catchAsyncErr');
const { campgroundSchema, reviewSchema } = require('./joi-schemas');
mongoose.connect('mongodb://localhost:27017/myYelpCamp')
    .then(() => console.log('MongoDB: Running!'))
    .catch(err => console.log('MongoDB: Error!', err));

const app = express();

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if (error) {
        throw new ExpressError(error.details.map(el => el.message).join(','), 404);
    } else {
        next();
    }
};
const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(error.details.map(el => el.message).join(','), 404);
    } else {
        next();
    }
};

app.get('/', (req, res) => res.render('home'));

// --- CAMPGROUNDS

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
});

app.get('/campgrounds/add', (req, res) => res.render('campgrounds/add'));

app.post('/campgrounds', validateCampground, catchAsyncErr(async (req, res, next) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
}));

app.get('/campgrounds/:id', catchAsyncErr(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/campground', {campground});
}));

app.get('/campgrounds/:id/update', catchAsyncErr(async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/update', {campground});
}));

app.patch('/campgrounds/:id', validateCampground, catchAsyncErr(async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndUpdate(id, req.body.campground, {runValidators: true});
    res.redirect(`/campgrounds/${id}`);
}));

app.delete('/campgrounds/:id', catchAsyncErr(async (req, res, next) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds');
}));

// --- REVIEWS

app.post('/campgrounds/:id/review', validateReview, catchAsyncErr(async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewID', catchAsyncErr(async (req, res, next) => {
    const {id, reviewID} = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
    await Review.findByIdAndDelete(reviewID);
    res.redirect(`/campgrounds/${id}`);
}));

// Wrong /path error handler
app.all('*', (req, res, next) => {
    next(new ExpressError('404: Not Found', 404));
});

// Async error handler
app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = 'Sorry, an unexpected error...';
    res.status(status).render('error', {err});
});

app.listen(3000, () => console.log('Running on port 3000!'));