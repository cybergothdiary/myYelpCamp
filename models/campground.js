const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: {
        type: String, required: true 
    },
    price: {
        type: Number, required: true
    },
    location: {
        type: String, required: true
    },
    image: { 
        type: String, required: true
    },
    description: {
        type: String, required: true
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function(campground) {
    if (campground.reviews.length) {
        const res = await Review.deleteMany({_id: { $in: campground.reviews }});
        console.log('After deleting a campground we pleasantly removed all the reviews!');
        console.log(res);
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);