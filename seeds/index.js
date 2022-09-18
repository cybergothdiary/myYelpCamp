const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers')

mongoose.connect('mongodb://localhost:27017/myYelpCamp')
    .then(() => console.log('Seeds MongoDB: Running!'))
    .catch(err => console.log('Seeds MongoDB: Error!', err));

const rArray = array => array[Math.floor(Math.random() * array.length)];

const seedDatabase = async () => {
    await Campground.deleteMany({})
        .then(() => console.log('Successfully wiped'))
        .catch((err) => console.log('Not deleted, Sorry! Error!', err));

    for (let i = 0; i < 23; i++) {
        const rIndex = Math.floor(Math.random() * 1000);
        const newCamp = new Campground({
            title: `${ rArray(descriptors)} ${rArray(places) }`,
            price: (Math.random() * 450 + 100).toFixed(2),
            location: `${ cities[rIndex].city}, ${cities[rIndex].state }`
        });

        await newCamp.save();
    }
}
seedDatabase().then(() => mongoose.connection.close());