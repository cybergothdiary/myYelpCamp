const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
mongoose.connect('mongodb://localhost:27017/myYelpCamp')
    .then(() => console.log('MongoDB: Running!'))
    .catch(err => console.log('MongoDB: Error!', err));

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get('/', (req, res) => res.render('home'));

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
});

app.get('/campgrounds/add', (req, res) => res.render('campgrounds/add'));

app.post('/campgrounds', async (req, res) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
});

app.get('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/campground', {campground});
});

app.get('/campgrounds/:id/update', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/update', {campground});
});

app.patch('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndUpdate(id, req.body);
    res.redirect(`/campgrounds/${id}`);
})

app.delete('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id)
    res.redirect('/campgrounds');
})

app.listen(3000, () => console.log('Running on port 3000!'));